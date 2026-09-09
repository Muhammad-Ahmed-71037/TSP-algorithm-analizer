import { SectionHeading, Card, Badge } from '../components/ui/Primitives';

export default function About() {
  return (
    <div className="max-w-3xl">
      <SectionHeading eyebrow="Coursework Project" title="Design & Analysis of Algorithms" />

      <div className="space-y-6">
        <Card className="p-6 border-l-4 border-l-[var(--color-primary)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-[var(--color-primary)] uppercase tracking-wider font-semibold">Coursework Submitter</span>
              <h3 className="font-display font-bold text-xl text-[var(--color-ink)] dark:text-[var(--color-ink-dark)] mt-0.5">
                Muhammad Ahmed
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] mt-1">
                BS Computer Science · Iqra University · Semester 5
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/Muhammad-Ahmed-71037"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg border border-[var(--color-border-subtle-dark)] bg-[var(--color-surface-2-dark)] text-xs font-medium hover:border-[var(--color-primary)] transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/muhammad-ahmed-201ba1344/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg border border-[var(--color-border-subtle-dark)] bg-[var(--color-surface-2-dark)] text-xs font-medium hover:border-[#38bdf8] transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-semibold text-lg mb-2">Problem Statement</h3>
          <p className="text-sm text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] leading-relaxed">
            Graph algorithms and NP-hard problems like the Traveling Salesman Problem (TSP) are difficult to grasp from abstract theory alone. Standard textbook pseudocode obscures practical trade-offs between exact exponential methods, dynamic programming memoization, greedy approximations, and geographic distance constraints.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-semibold text-lg mb-2">Solution</h3>
          <p className="text-sm text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] leading-relaxed">
            An interactive platform that uses real-world city data to demonstrate graph algorithms. Cities become
            graph vertices, geographic distance (via the Haversine formula) becomes edge weight, and three classical
            algorithms - implemented entirely from scratch - run against graphs you build yourself, with every
            decision they make recorded and replayable step by step.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-semibold text-lg mb-3">DAA Concepts Demonstrated</h3>
          <ul className="text-sm text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] leading-relaxed list-disc pl-5 space-y-1">
            <li>Graphs (vertices, weighted edges, adjacency lists)</li>
            <li>Greedy algorithms (Dijkstra, Prim)</li>
            <li>Dynamic programming (Floyd-Warshall)</li>
            <li>Single-source and all-pairs shortest paths</li>
            <li>Minimum spanning trees</li>
            <li>The Traveling Salesman Problem - approximate (heuristic) vs. exact (dynamic programming, exhaustive search with pruning)</li>
            <li>Complexity analysis (time and space, Big-O)</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-semibold text-lg mb-3">Academic Classification</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Badge tone="floyd">Dynamic Programming</Badge>
              <span className="text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]">Dynamic Programming (Bitonic Subproblems) → Traveling Salesman Problem (O(V²))</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="prim">Greedy (Cheapest Insertion)</Badge>
              <span className="text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]">Greedy Heuristic → Traveling Salesman Problem (O(V³))</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="dijkstra">Dijkstra SSSP Tour</Badge>
              <span className="text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]">Greedy Shortest Path Repeated → Multi-Destination TSP with Independent Return</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="ai">AI / LLM Route Planner</Badge>
              <span className="text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]">Independent LLM Heuristic → TSP Route Optimization over Real Coordinate Matrices</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="dijkstra">Dijkstra SSSP</Badge>
              <span className="text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]">Greedy Algorithm → Single-Source Shortest Path (O((V + E) log V))</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="prim">Prim MST</Badge>
              <span className="text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]">Greedy Algorithm → Minimum Spanning Tree (O(E log V))</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="floyd">Floyd-Warshall</Badge>
              <span className="text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)]">Dynamic Programming → All-Pairs Shortest Path (O(V³))</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-semibold text-lg mb-2">AI's Role</h3>
          <p className="text-sm text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] leading-relaxed mb-3">
            This is accurately described as <strong>LLM-powered algorithm analysis and tutoring</strong> - not a
            machine learning model, and never a replacement for the algorithms themselves. The AI only ever explains
            results that were already computed deterministically by the algorithm code in <span className="font-data">server/algorithms/</span>.
          </p>
          <ul className="text-sm text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] leading-relaxed list-disc pl-5 space-y-1">
            <li>Explaining a single algorithm's result in plain language</li>
            <li>Answering open-ended tutoring questions about graph theory</li>
            <li>Comparing multiple algorithm results run on the same graph</li>
            <li>Interpreting real, measured performance differences</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-semibold text-lg mb-2">Data & Distance Disclaimer</h3>
          <p className="text-sm text-[var(--color-ink-muted)] dark:text-[var(--color-ink-muted-dark)] leading-relaxed">
            Distances shown in this application are approximate geographic distances calculated using the Haversine
            formula (straight-line, "as the crow flies" distance) and should not be interpreted as actual road or
            travel distances. The dataset (worldcities.csv) contains no road/flight connectivity - the graph's edges
            are synthesised using a nearest-neighbor strategy over real coordinates.
          </p>
        </Card>
      </div>
    </div>
  );
}
