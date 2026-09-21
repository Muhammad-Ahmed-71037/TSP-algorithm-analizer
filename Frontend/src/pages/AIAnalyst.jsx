import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { useGraph } from '../context/GraphContext';
import { useTSP } from '../context/TSPContext';
import { useToast } from '../context/ToastContext';
import * as api from '../services/api';
import { SectionHeading, Card, Button, Badge } from '../components/ui/Primitives';

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
      <SectionHeading eyebrow="AI Assistant" title="AI Algorithm Tutor" description="Interactive AI tutor to explain graph theory concepts, interpret your TSP results, and answer algorithm questions in plain language." />

      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <h3 className="font-semibold text-sm mb-3 text-[#1E1E1E]">Current Context</h3>
            {!graph && !tspResults.dynamicProgramming && !tspResults.greedy && !tspResults.dijkstraTSP && !tspResults.aiTSP ? (
              <p className="text-sm text-[#4A4A4A]">No graph or TSP tour generated yet. Build one in the Graph Workspace or TSP Explorer to give the AI real context.</p>
            ) : (
              <div className="space-y-3 text-sm">
                {graph && (
                  <p className="font-data text-xs text-[#4A4A4A] font-semibold">
                    {context.graphVertices} vertices · {context.graphEdges} edges
                  </p>
                )}
                {context.dijkstra && (
                  <div>
                    <Badge tone="dijkstra">Dijkstra</Badge>
                    <p className="font-data text-xs mt-1 text-[#252525] font-medium">{context.dijkstra.distanceKm} km · {context.dijkstra.executionTimeMs} ms</p>
                  </div>
                )}
                {context.prim && (
                  <div>
                    <Badge tone="prim">Prim</Badge>
                    <p className="font-data text-xs mt-1 text-[#252525] font-medium">{context.prim.mstWeightKm} km MST · {context.prim.executionTimeMs} ms</p>
                  </div>
                )}
                {context.floydWarshall && (
                  <div>
                    <Badge tone="floyd">Floyd-Warshall</Badge>
                    <p className="font-data text-xs mt-1 text-[#252525] font-medium">{context.floydWarshall.totalUpdates} updates · {context.floydWarshall.executionTimeMs} ms</p>
                  </div>
                )}
                {context.tsp?.dynamicProgramming && (
                  <div>
                    <Badge tone="floyd">TSP: Dynamic Programming</Badge>
                    <p className="font-data text-xs mt-1 text-[#252525] font-medium">{context.tsp.dynamicProgramming.totalDistanceKm} km (optimal) · {context.tsp.dynamicProgramming.executionTimeMs} ms</p>
                  </div>
                )}
                {context.tsp?.greedy && (
                  <div>
                    <Badge tone="prim">TSP: Greedy</Badge>
                    <p className="font-data text-xs mt-1 text-[#252525] font-medium">{context.tsp.greedy.totalDistanceKm} km · {context.tsp.greedy.executionTimeMs} ms</p>
                  </div>
                )}
                {context.tsp?.dijkstra && (
                  <div>
                    <Badge tone="dijkstra">TSP: Dijkstra</Badge>
                    <p className="font-data text-xs mt-1 text-[#252525] font-medium">{context.tsp.dijkstra.totalDistanceKm} km · {context.tsp.dijkstra.executionTimeMs} ms</p>
                  </div>
                )}
                {context.tsp?.aiTSP && (
                  <div>
                    <Badge tone="ai">TSP: AI Solver</Badge>
                    <p className="font-data text-xs mt-1 text-[#252525] font-medium">{context.tsp.aiTSP.totalDistanceKm} km · {context.tsp.aiTSP.requestTimeMs} ms</p>
                  </div>
                )}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-sm mb-3 text-[#1E1E1E]">Try asking</h3>
            <div className="flex flex-col gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-left text-xs px-3 py-2 rounded-lg bg-[#FFFDF5] hover:bg-[#FFDCDC]/40 text-[#252525] border border-[#E5BEBE] hover:border-[#D8A2A2] transition-colors font-medium"
                >
                  {q}
                </button>
              ))}
            </div>
          </Card>
        </div>

        <Card className="flex flex-col h-[600px] overflow-hidden">
          <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-thin p-4 space-y-3 bg-[#FFFDF5]">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 text-xs font-bold ${m.role === 'ai' ? 'bg-[#8EA66B] text-white' : 'bg-[#D8A2A2] text-[#2A2424]'}`}>
                  {m.role === 'ai' ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                </div>
                <div className={`max-w-[80%] rounded-lg px-3.5 py-2 text-xs leading-relaxed whitespace-pre-wrap ${m.role === 'ai' ? 'bg-white border border-[#E5BEBE] text-[#252525] shadow-2xs' : 'bg-[#FFDCDC] text-[#252525] border border-[#E5BEBE] font-medium'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5">
                <div className="h-7 w-7 rounded-md flex items-center justify-center bg-[#8EA66B] text-white">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                </div>
                <div className="rounded-lg px-3.5 py-2 text-xs bg-white border border-[#E5BEBE] text-[#4A4A4A] italic">
                  Consulting algorithmic knowledge base…
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-[#E5BEBE] bg-[#FFFDF5] p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask about time complexity, bitonic subproblems, edge relaxation..."
              className="flex-1 rounded-lg border border-[#E5BEBE] bg-white px-3 py-2 text-xs text-[#252525] placeholder:text-[#77716A] outline-none focus:border-[#8EA66B] focus:ring-1 focus:ring-[#8EA66B] transition-colors"
            />
            <Button variant="primary" size="sm" icon={Send} onClick={() => send()} loading={loading} disabled={!input.trim()}>
              Send Query
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
