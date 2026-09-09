import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { useGraph } from '../context/GraphContext';
import { useTSP } from '../context/TSPContext';
import { useToast } from '../context/ToastContext';
import * as api from '../services/api';
import { SectionHeading, Card, Button, Badge } from '../components/ui/Primitives';
import TSPAlgorithm from './TSPAlgorithm';

const SUGGESTED_QUESTIONS = [
  'Why is Dijkstra classified as greedy?',
  'Why is Floyd-Warshall O(V³)?',
  'What is edge relaxation?',
  "Why can't Dijkstra handle negative edges?",
  'When should I use Prim instead of Dijkstra?',
  'Why is Dynamic Programming guaranteed optimal but Greedy is not?',
  'How does Dijkstra return to the source in the TSP tour?',
  'Explain this result like I\'m a beginner.',
];

function buildAppContext(graph, results, tspResults) {
  const hasAny = graph || tspResults.dynamicProgramming || tspResults.greedy || tspResults.dijkstraTSP || tspResults.aiTSP;
  if (!hasAny) return { note: 'No graph or TSP tour has been generated yet in the app.' };
  return {
    graphVertices: graph?.meta.vertices ?? null,
    graphEdges: graph?.meta.edges ?? null,
    dijkstra: results.dijkstra
      ? {
          source: results.dijkstra.result.source,
          destination: results.dijkstra.result.destination,
          distanceKm: results.dijkstra.result.distance,
          executionTimeMs: results.dijkstra.metrics.executionTimeMs,
        }
      : null,
    prim: results.prim
      ? { mstWeightKm: results.prim.result.mstWeight, executionTimeMs: results.prim.metrics.executionTimeMs }
      : null,
    floydWarshall: results.floydWarshall
      ? { totalUpdates: results.floydWarshall.metrics.totalUpdates, executionTimeMs: results.floydWarshall.metrics.executionTimeMs }
      : null,
    tsp: {
      dynamicProgramming: tspResults.dynamicProgramming
        ? { totalDistanceKm: tspResults.dynamicProgramming.result.totalDistance, optimal: false, executionTimeMs: tspResults.dynamicProgramming.metrics.executionTimeMs }
        : null,
      greedy: tspResults.greedy
        ? { totalDistanceKm: tspResults.greedy.result.totalDistance, optimal: false, executionTimeMs: tspResults.greedy.metrics.executionTimeMs }
        : null,
      dijkstra: tspResults.dijkstraTSP
        ? {
            totalDistanceKm: tspResults.dijkstraTSP.result.totalDistance,
            optimal: false,
            executionTimeMs: tspResults.dijkstraTSP.metrics.executionTimeMs,
          }
        : null,
      aiTSP: tspResults.aiTSP
        ? { totalDistanceKm: tspResults.aiTSP.result.totalDistance, requestTimeMs: tspResults.aiTSP.metrics.requestTimeMs }
        : null,
    },
  };
}

export default function AIAnalyst() {
  const { graph, results } = useGraph();
  const { results: tspResults } = useTSP();
  const { addToast } = useToast();
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hi! I'm your independent AI algorithm tutor. Ask about Dynamic Programming, Greedy, Dijkstra, TSP routes, comparisons, or results from the Graph Workspace." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async (question) => {
    const q = (question ?? input).trim();
    if (!q) return;
    setMessages((m) => [...m, { role: 'user', content: q }]);
    setInput('');
    setLoading(true);
    try {
      const context = buildAppContext(graph, results, tspResults);
      const res = await api.aiTutor(q, context);
      setMessages((m) => [...m, { role: 'ai', content: res.answer }]);
    } catch (err) {
      addToast(err.message, 'error');
      setMessages((m) => [...m, { role: 'ai', content: `I couldn't reach the AI service: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const context = buildAppContext(graph, results, tspResults);

  return (
    <div>
      <SectionHeading eyebrow="AI" title="🤖 AI Algorithm Analyst" description="Understand what happened inside your algorithm." />

      <div className="mb-6">
        <TSPAlgorithm algorithm="aiTSP" />
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <h3 className="font-display font-semibold text-sm mb-3">Current Context</h3>
            {!graph && !tspResults.dynamicProgramming && !tspResults.greedy && !tspResults.dijkstraTSP && !tspResults.aiTSP ? (
              <p className="text-sm text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]">No graph or TSP tour generated yet. Build one in the Graph Workspace or TSP Explorer to give the AI real context.</p>
            ) : (
              <div className="space-y-3 text-sm">
                {graph && (
                  <p className="font-data text-xs text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]">
                    {context.graphVertices} vertices · {context.graphEdges} edges
                  </p>
                )}
                {context.dijkstra && (
                  <div>
                    <Badge tone="dijkstra">Dijkstra</Badge>
                    <p className="font-data text-xs mt-1">{context.dijkstra.distanceKm} km · {context.dijkstra.executionTimeMs} ms</p>
                  </div>
                )}
                {context.prim && (
                  <div>
                    <Badge tone="prim">Prim</Badge>
                    <p className="font-data text-xs mt-1">{context.prim.mstWeightKm} km MST · {context.prim.executionTimeMs} ms</p>
                  </div>
                )}
                {context.floydWarshall && (
                  <div>
                    <Badge tone="floyd">Floyd-Warshall</Badge>
                    <p className="font-data text-xs mt-1">{context.floydWarshall.totalUpdates} updates · {context.floydWarshall.executionTimeMs} ms</p>
                  </div>
                )}
                {context.tsp?.dynamicProgramming && (
                  <div>
                    <Badge tone="floyd">TSP: Dynamic Programming</Badge>
                    <p className="font-data text-xs mt-1">{context.tsp.dynamicProgramming.totalDistanceKm} km (optimal) · {context.tsp.dynamicProgramming.executionTimeMs} ms</p>
                  </div>
                )}
                {context.tsp?.greedy && (
                  <div>
                    <Badge tone="prim">TSP: Greedy</Badge>
                    <p className="font-data text-xs mt-1">{context.tsp.greedy.totalDistanceKm} km · {context.tsp.greedy.executionTimeMs} ms</p>
                  </div>
                )}
                {context.tsp?.dijkstra && (
                  <div>
                    <Badge tone="dijkstra">TSP: Dijkstra</Badge>
                    <p className="font-data text-xs mt-1">{context.tsp.dijkstra.totalDistanceKm} km · {context.tsp.dijkstra.executionTimeMs} ms</p>
                  </div>
                )}
                {context.tsp?.aiTSP && (
                  <div>
                    <Badge tone="ai">TSP: AI Solver</Badge>
                    <p className="font-data text-xs mt-1">{context.tsp.aiTSP.totalDistanceKm} km · {context.tsp.aiTSP.requestTimeMs} ms</p>
                  </div>
                )}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="font-display font-semibold text-sm mb-3">Try asking</h3>
            <div className="flex flex-col gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-left text-xs px-3 py-2 rounded-lg bg-[var(--color-surface-2)] dark:bg-[var(--color-surface-2-dark)] hover:opacity-80"
                >
                  {q}
                </button>
              ))}
            </div>
          </Card>
        </div>

        <Card className="flex flex-col h-[600px]">
          <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-thin p-5 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'ai' ? 'bg-[var(--color-ai-soft)] dark:bg-[var(--color-ai-soft-dark)] text-[var(--color-ai)]' : 'bg-[var(--color-dijkstra-soft)] dark:bg-[var(--color-dijkstra-soft-dark)] text-[var(--color-dijkstra)]'}`}>
                  {m.role === 'ai' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'ai' ? 'bg-[var(--color-surface-2)] dark:bg-[var(--color-surface-2-dark)]' : 'bg-[var(--color-dijkstra)] text-white'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full flex items-center justify-center bg-[var(--color-ai-soft)] dark:bg-[var(--color-ai-soft-dark)] text-[var(--color-ai)]">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </div>
                <div className="rounded-2xl px-4 py-2.5 text-sm bg-[var(--color-surface-2)] dark:bg-[var(--color-surface-2-dark)] text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]">
                  Thinking…
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)] p-4 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask about an algorithm or your result..."
              className="flex-1 rounded-xl border border-[var(--color-border-subtle)] dark:border-[var(--color-border-subtle-dark)] bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-dijkstra)]"
            />
            <Button icon={Send} onClick={() => send()} loading={loading} disabled={!input.trim()}>
              Send
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
