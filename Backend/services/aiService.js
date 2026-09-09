/**
 * aiService.js
 * ---------------------------------------------------------------------------
 * The ONLY place in this codebase that talks to an LLM. Runs entirely on
 * the server so the API key is never exposed to the browser.
 *
 * HARD RULE (see README "AI must not replace algorithms"): the AI is never
 * asked to compute a shortest path, an MST, a distance matrix, or any
 * numeric result. It only ever receives an already-computed, structured
 * summary of what the deterministic algorithm code produced, and is asked
 * to explain / compare / tutor in natural language. If the AI's reply
 * disagrees with the numbers we gave it, that's a hallucination in the
 * explanation text, not an alternate "AI answer" - the numbers on screen
 * always come from algorithms/*.js.
 */

function getAIConfig() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY || '';
  const isOpenRouter = apiKey.startsWith('sk-or-');
  const apiUrl =
    process.env.OPENAI_BASE_URL ||
    (isOpenRouter ? 'https://openrouter.ai/api/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions');

  let model = process.env.OPENAI_MODEL;
  if (!model) {
    model = isOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini';
  } else if (isOpenRouter && !model.includes('/')) {
    model = `openai/${model}`;
  }

  return { apiKey, apiUrl, model, isOpenRouter };
}

const REQUEST_TIMEOUT_MS = 20000;

const SYSTEM_PROMPT = `You are the explanation assistant for a university DAA TSP application.
Explain deterministic results from the supplied project data without inventing distances, timings, or routes.
The application has independent Dynamic Programming, Greedy, Dijkstra, AI TSP, and Graph Workspace sections.
Keep answers educational, concise, and grounded in the supplied values.`;

const TSP_SOLVER_PROMPT = `You are an independent TSP route planner.
Given a source ID and a list of destination IDs, construct a closed tour that:
1. Starts at the source ID.
2. Visits EVERY single destination ID in the list exactly once (no omissions, no extra IDs).
3. Ends back at the source ID.
If outbound waypoints and a turnaround destination are specified, travel to the turnaround destination via outbound waypoints, and return through the remaining unvisited return waypoints back to the source.
Return ONLY valid JSON with this shape:
{"route":["source-id", ...every_destination_id_in_order, "source-id"], "reasoning":"brief educational explanation of the route"}
Coordinates and the supplied distance matrix are real project data. Use them to order the route efficiently.`;

async function callOpenAI(messages, { temperature = 0.4, maxTokens = 700 } = {}) {
  const { apiKey, apiUrl, model, isOpenRouter } = getAIConfig();
  if (!apiKey) {
    const err = new Error(
      'AI features are not configured on this server. Add OPENAI_API_KEY to server/.env to enable them.'
    );
    err.statusCode = 503;
    err.isOperational = true;
    throw err;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    };
    if (isOpenRouter) {
      headers['HTTP-Referer'] = 'http://localhost:5173';
      headers['X-Title'] = 'TSP Algorithm Visualizer';
    }

    response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeoutErr = new Error('The AI request timed out. Please try again.');
      timeoutErr.statusCode = 504;
      timeoutErr.isOperational = true;
      throw timeoutErr;
    }
    const netErr = new Error('Could not reach the AI provider. Check your network connection.');
    netErr.statusCode = 502;
    netErr.isOperational = true;
    throw netErr;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    let detail = '';
    try {
      const body = await response.json();
      detail = body?.error?.message || '';
    } catch {
      /* ignore parse errors on error body */
    }
    const apiErr = new Error(
      `AI provider returned an error${detail ? `: ${detail}` : ` (status ${response.status})`}.`
    );
    apiErr.statusCode = 502;
    apiErr.isOperational = true;
    throw apiErr;
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    const invalidErr = new Error('AI provider returned an unexpected response format.');
    invalidErr.statusCode = 502;
    invalidErr.isOperational = true;
    throw invalidErr;
  }
  return text.trim();
}

/**
 * Feature 1: explain a single algorithm run using its real, structured result.
 */
async function explainResult(context) {
  const prompt = `Here is the actual result of running an algorithm in the app. Explain what happened, in an \
educational tone, referencing the specific numbers below.\n\n${JSON.stringify(context, null, 2)}`;
  return callOpenAI([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ]);
}

/**
 * Feature 2: open-ended algorithm tutor question, grounded in current app context.
 */
async function tutorAnswer(question, context) {
  const prompt = `Student question: "${question}"\n\nCurrent app context (may or may not be relevant to the \
question - use it if helpful, otherwise answer generally but stay within DAA/graph-algorithm scope):\n${JSON.stringify(
    context || {},
    null,
    2
  )}`;
  return callOpenAI([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ]);
}

/**
 * Feature 3: compare multiple already-executed algorithm results.
 */
async function compareResults(results) {
  const prompt = `Compare the following algorithm results, which were all run on the SAME graph. Discuss \
differences in approach (Greedy vs Dynamic Programming), correctness guarantees, complexity, and when a \
student should prefer one over another. Use only the numbers given below - do not invent any.\n\n${JSON.stringify(
    results,
    null,
    2
  )}`;
  return callOpenAI([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ]);
}

/**
 * Feature 4: explain observed performance/timing behaviour across algorithms.
 */
async function explainPerformance(metrics) {
  const prompt = `Here are REAL, measured execution metrics captured from actual runs in this app (not \
estimates). Explain the observed performance differences and relate them to each algorithm's theoretical \
complexity and the given graph size. Do not invent any numbers beyond what is provided.\n\n${JSON.stringify(
    metrics,
    null,
    2
  )}`;
  return callOpenAI([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ]);
}

function parseStructuredResponse(text) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error('The AI returned an invalid route format.');
  }
}

async function solveTSP(input) {
  const text = await callOpenAI([
    { role: 'system', content: TSP_SOLVER_PROMPT },
    {
      role: 'user',
      content: `Source ID: "${input.source}"\nRequired Destination IDs to include in route (${input.destinations.length} total): ${JSON.stringify(input.destinations)}\nCities metadata: ${JSON.stringify(input.cities)}\nDistance Matrix: ${JSON.stringify(input.distanceMatrix)}`,
    },
  ], { temperature: 0.2, maxTokens: 1200 });
  return parseStructuredResponse(text);
}

module.exports = { explainResult, tutorAnswer, compareResults, explainPerformance, solveTSP };
