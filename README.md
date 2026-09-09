# Intelligent Graph Algorithm Analyzer

**Explore. Visualize. Analyze. Understand.**

An interactive platform for analyzing graph algorithms using real-world city data and AI-powered
explanations. Built as a Design and Analysis of Algorithms (DAA) semester project.

Real data → real graph → real algorithms → real execution → real visualization → real complexity
analysis → real comparison → AI-powered explanation.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Problem Statement & Objectives](#problem-statement--objectives)
3. [Features](#features)
4. [Dataset](#dataset)
5. [Dataset Processing](#dataset-processing)
6. [Graph Construction](#graph-construction)
7. [Algorithms](#algorithms)
8. [Traveling Salesman Problem (TSP)](#traveling-salesman-problem-tsp)
9. [Complexity Analysis](#complexity-analysis)
10. [AI Features](#ai-features)
11. [Technology Stack](#technology-stack)
12. [Architecture](#architecture)
13. [Project Structure](#project-structure)
14. [Installation](#installation)
15. [Environment Setup](#environment-setup)
16. [Running the App](#running-the-app)
17. [API Documentation](#api-documentation)
18. [Security](#security)
19. [Testing](#testing)
20. [Known Limitations & Future Enhancements](#known-limitations--future-enhancements)

---

## Introduction

Graph algorithms are often difficult to understand from theory alone. This project makes them
tangible: cities become graph vertices, geographic distance becomes edge weight, and three
classical algorithms - **implemented entirely from scratch** - run against graphs you build
yourself, with every decision they make recorded and replayable step by step. An LLM layer then
explains the *actual, already-computed* results in plain language.

## Problem Statement & Objectives

- Demonstrate Dijkstra (Greedy), Prim (Greedy), and Floyd-Warshall (Dynamic Programming) on a
  real, non-trivial dataset rather than toy examples.
- Make each algorithm's decision-making process visible and replayable, not just its final answer.
- Provide honest, measured complexity/performance data - never fabricated benchmarks.
- Use AI strictly as an explanatory layer on top of deterministic algorithm output, never as a
  substitute for the algorithms themselves.

## Features

- 50,000+ row real-world city dataset, cleaned and validated on load
- No artificial cap on city selection - search the full dataset via a debounced autocomplete; only
  on-screen search *results* are capped for readability, never the dataset or your selection
- Nearest-neighbor graph construction from real coordinates (Haversine distance)
- Dijkstra, Prim, and Floyd-Warshall implemented from scratch (no routing/MST libraries)
- Five peer-level application sections: Dynamic Programming, Greedy, Dijkstra, AI / LLM, and
  Graph Workspace
- Full step-by-step execution history for Dijkstra/Prim/Floyd-Warshall, with playback controls
- Geographic map view (Leaflet) and an abstract graph view (custom SVG), both highlight-synced to
  the current step or tour
- Theoretical complexity explorer with growth-curve charts
- Algorithm comparison with real measured metrics
- AI explanation, tutoring, comparison, and performance-analysis features (OpenAI, server-side only)
- Dark/light mode, responsive layout, toast notifications, empty/loading states

## Dataset

`dataset/worldcities.csv` (also copied to `server/dataset/worldcities.csv` for the running app).

The dataset was inspected before any implementation decisions were made. Actual columns:

```
city, city_ascii, lat, lng, country, iso2, iso3, admin_name, capital, population, id
```

Measured at build time: 50,250 rows, 242 countries, 0 missing city/country/coordinate values,
2,377 duplicate `(city, country)` pairs, ~0.8% of rows missing population.

## Dataset Processing

Implemented in `server/services/datasetService.js`. On load, the raw CSV is cleaned:

- Drop rows with missing/empty city or country name
- Drop rows with missing, non-numeric, or out-of-range coordinates (lat in [-90, 90], lng in [-180, 180])
- Drop duplicate `(city, country)` pairs, keeping the first occurrence
- Population is kept as `null` (not coerced to 0) when genuinely missing

After cleaning: **47,873 valid records** across 242 countries. Cleaning statistics are exposed via
`GET /api/cities/stats` and shown on the Dataset page - never hard-coded.

## Graph Construction

`worldcities.csv` contains no road/flight connectivity - only coordinates. Edges are synthesised:

1. For each selected city, compute the great-circle ("as the crow flies") distance to every other
   selected city using the **Haversine formula** (`server/utils/haversine.js`).
2. Connect each city to its **k nearest neighbors** (k is user-configurable: 3/5/8/10).
3. Take the **union** of all such connections and make the result undirected/symmetric, so the
   graph doesn't have one-way "nearest neighbor" edges.

This is a deliberate, documented choice (not "real" road distance) - the UI labels every distance
as *"approximate geographic distance"* and links to this explanation.

Graph construction is `O(N^2)` over the *selected* working set (bounded to 200 cities by the UI),
not over the full 50k-row dataset - selection happens first, then the bounded pairwise computation.

## Algorithms

All three are implemented from scratch in `server/algorithms/`, with a hand-written binary
min-heap (`server/utils/MinHeap.js`) used as the priority queue for Dijkstra and Prim - no
npm routing/MST/priority-queue package is used for the actual algorithm logic.

### Dijkstra - Greedy - Single-Source Shortest Path
`server/algorithms/dijkstra.js`. Classic relaxation-based shortest path using a binary min-heap.
Returns the shortest distance, reconstructed path, and a full step history (initialize -> select-min
-> examine-edge -> relax -> complete).

### Prim - Greedy - Minimum Spanning Tree
`server/algorithms/prim.js`. Grows an MST one vertex at a time, always adding the minimum-weight
edge crossing the current cut. Correctly reports a partial result if the graph is disconnected.

### Floyd-Warshall - Dynamic Programming - All-Pairs Shortest Path
`server/algorithms/floydWarshall.js`. Standard `D[k][i][j] = min(D[k-1][i][j], D[k-1][i][k] + D[k-1][k][j])`
recurrence over an in-place VxV distance matrix. Because a full run performs exactly `V^3`
comparisons (too many to animate one-by-one for large graphs), the visualizer records every actual
*improvement* to the matrix, capped at 500 recorded steps for the UI - the underlying computation
itself is always the full, mathematically correct `O(V^3)` run; only the *replay* is capped, and
the UI says so honestly (`truncatedSteps` in the response) rather than silently dropping data.

Each algorithm's output is validated by unit tests in `server/tests/`, including cross-validation
(Dijkstra's shortest distance must equal the corresponding Floyd-Warshall matrix cell).

## Traveling Salesman Problem (TSP)

The application exposes independent TSP sections at `/dynamic-programming`, `/greedy`, and
`/dijkstra`, plus the independent AI / LLM section at `/ai-analyst`. Each uses one source and
multiple searchable destinations and returns to the source. Graph Workspace remains separate.

**No artificial city-selection limit.** The full cleaned dataset (47,873 cities) is searchable via
a debounced, server-side `CitySearchSelector` (`client/src/components/tsp/CitySearchSelector.jsx`) -
never rendered as one giant list. You can select as many cities as the available runtime resources
allow; only visible search results are paginated. The full dataset remains server-side and only
selected records are returned to the browser and rendered.

### Dynamic Programming — bitonic-tour DP — O(V²)
`server/algorithms/tsp/dynamicProgramming.js` uses a two-chain recurrence over locations sorted by
longitude. It reuses previously calculated subproblems and returns a valid source-to-source tour,
optimal under the bitonic ordering assumption rather than claiming a general exact TSP result.

### Greedy — cheapest insertion heuristic
`server/algorithms/tsp/greedy.js` repeatedly inserts the destination with the locally cheapest
increase. It demonstrates greedy decision-making with a cheapest-insertion strategy.

### Dijkstra TSP — repeated graph shortest paths
`server/algorithms/tsp/dijkstraTour.js` runs Dijkstra independently for every source-to-stop leg,
including a separately calculated return leg through the available graph.



| Algorithm | Category | Time | Space |
|---|---|---|---|
| Dijkstra | Greedy | O((V + E) log V) | O(V + E) |
| Prim | Greedy | O(E log V) | O(V + E) |
| Floyd-Warshall | Dynamic Programming | O(V^3) | O(V^2) |
| Dynamic Programming (TSP, bitonic) | Dynamic Programming | O(V^2) | O(V^2) |
| Greedy (TSP) | Greedy Heuristic | O(V^3) | O(V) |
| Dijkstra (TSP) | Greedy shortest paths | O(V * (V + E) log V) | O(V + E) |

The Complexity page separates **theoretical growth curves** (a pure math visualization of
O(V), O(log V), O(V log V), O(V^2), O(V^3)) from **observed execution time** (measured
`process.hrtime.bigint()` timings from your actual runs) - these are never conflated.

## AI Features

The AI section contains two independent features: the existing chatbot for explanations and tutoring,
and a new AI TSP Solver at `POST /api/ai/tsp-solve`. The solver receives only selected city records
and their distance matrix, requests a structured route from the LLM, validates every route ID and
source return, then calculates total distance from project data. Its displayed timing is the measured
AI request time, including network and response parsing. All AI calls happen server-side
(`server/services/aiService.js`); the API key never reaches the browser.

**Hard rule enforced throughout the codebase:** the AI is only ever given an *already-computed*,
structured summary of a real algorithm run (distances, paths, MST edges, matrix values, timings,
step counts). It is never asked to compute a path, an MST, a distance, or a complexity figure -
and the system prompt explicitly instructs it not to invent numbers beyond what it's given.

1. **Explain Result** (`POST /api/ai/explain`) - explains one algorithm's actual result
2. **AI Tutor** (`POST /api/ai/tutor`) - open-ended Q&A grounded in current app context, on the AI Analyst page
3. **Compare with AI** (`POST /api/ai/compare`) - compares 2+ real results run on the same graph
4. **Performance Analysis** (`POST /api/ai/performance`) - explains real, measured timing differences

If `OPENAI_API_KEY` is not set, these endpoints return a clean `503` and the rest of the app
(all algorithms, graph, dataset, visualization) works fully without it.

## Technology Stack

**Frontend:** React 19, Vite, Tailwind CSS v4, React Router, Lucide React, Recharts, Leaflet / React-Leaflet
**Backend:** Node.js, Express 5
**AI:** OpenAI Chat Completions API
**Testing:** Node's built-in test runner (`node --test`)
**No database** - the dataset is static (loaded once from CSV into memory) and every other
computation is cheap enough to redo per request statelessly. This keeps the architecture small
enough to fully explain in a viva.

## Architecture

```
worldcities.csv -> Dataset Processing -> City Selection -> Graph Construction (Haversine)
                                                              |
                              +--------------------------------+--------------------------------+
                              v                               v                                 v
                         Dijkstra                          Prim                        Floyd-Warshall
                         (Greedy)                         (Greedy)                    (Dynamic Programming)
                              +--------------------------------+--------------------------------+
                                                              v
                                          Results + Metrics -> Visualization -> Complexity -> Comparison
                                                              v
                                          AI Algorithm Analyst . AI Tutor . AI Comparison
```

The frontend never computes algorithm results itself - every run is a request to the Express
backend, which rebuilds the graph deterministically from `{cityIds, k}` and executes the real
algorithm code. This keeps the "single source of truth" in one place and makes the system easy to
reason about and explain.

## Project Structure

```
intelligent-graph-algorithm-analyzer/
├── client/                        React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/             Layout.jsx (sidebar/drawer/header)
│   │   │   ├── ui/                 Primitives, StatCard, Toaster
│   │   │   ├── map/                MapView.jsx (Leaflet)
│   │   │   ├── graph/              GraphCanvas.jsx (abstract SVG view), NetworkHero.jsx
│   │   │   ├── visualizer/         StepVisualizer.jsx, LiveStatePanels.jsx
│   │   │   ├── results/            ResultCard.jsx, TSPResultCard.jsx
│   │   │   ├── tsp/                CitySearchSelector.jsx (reusable search/autocomplete)
│   │   ├── pages/                  Home, Dashboard, Dataset, GraphWorkspace, TSP, Compare,
│   │   │                           Complexity, AIAnalyst, About, NotFound
│   │   ├── context/                ThemeContext, ToastContext, GraphContext, TSPContext
│   │   ├── services/api.js         Central API client
│   │   └── utils/format.js         Step description humanization, Infinity display helpers
│   └── package.json
│
├── server/                        Express backend
│   ├── algorithms/                 dijkstra.js, prim.js, floydWarshall.js  (the DAA core)
│   │   └── tsp/                    dynamicProgramming.js, greedy.js, dijkstraTour.js
│   ├── services/                   datasetService.js, graphService.js, tspGraphService.js, aiService.js, aiTspService.js
│   ├── controllers/                citiesController.js, graphController.js,
│   │                                algorithmController.js, tspController.js, aiController.js
│   ├── routes/                     cities.js, graph.js, algorithms.js, tsp.js, ai.js
│   ├── middleware/                 errorHandler.js, validate.js
│   ├── utils/                      MinHeap.js, haversine.js, csvLoader.js
│   ├── tests/                      dijkstra.test.js, prim.test.js, floydWarshall.test.js, graph.test.js, tsp.test.js
│   ├── dataset/worldcities.csv
│   ├── .env.example
│   └── server.js
│
├── dataset/worldcities.csv         Source copy of the dataset
└── README.md
```

## Installation

Requires **Node.js 18+** (developed and tested on Node 22).

```bash
# 1. Extract/clone the project, then from the project root:
cd server
npm install

cd ../client
npm install
```

## Environment Setup

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
OPENAI_API_KEY=          # optional - leave blank to run without AI features
OPENAI_MODEL=gpt-4o-mini
NODE_ENV=development
```

Get an OpenAI API key at https://platform.openai.com/api-keys if you want the AI features. The
app is fully functional (all three algorithms, visualization, dataset, graph, complexity,
comparison) without one.

## Running the App

Open two terminals:

```bash
# Terminal 1 - backend (http://localhost:5000)
cd server
npm run dev

# Terminal 2 - frontend (http://localhost:5173)
cd client
npm run dev
```

Open **http://localhost:5173** in your browser. The Vite dev server proxies `/api/*` requests to
the Express backend automatically (see `client/vite.config.js`).

To run the backend in production mode: `npm start` (instead of `npm run dev`) inside `server/`.
To build a static frontend bundle: `npm run build` inside `client/` (outputs to `client/dist/`).

## API Documentation

All endpoints are prefixed with `/api`.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/cities` | Paginated/searchable/sortable city list. Query: `search, country, sortBy, order, page, pageSize` |
| GET | `/cities/stats` | Dataset cleaning statistics |
| GET | `/cities/countries` | List of distinct countries |
| POST | `/cities/batch` | `{ ids: string[] }` -> full city objects |
| POST | `/graph` | `{ cityIds, k }` -> nearest-neighbor graph + metadata |
| POST | `/algorithm/dijkstra` | `{ cityIds, k, source, destination }` -> full Dijkstra result |
| POST | `/algorithm/prim` | `{ cityIds, k, source }` -> full Prim (MST) result |
| POST | `/algorithm/floyd-warshall` | `{ cityIds, k, source?, destination? }` -> full Floyd-Warshall result |
| POST | `/tsp/graph` | `{ cityIds }` -> complete-graph metadata for a TSP instance |
| POST | `/tsp/dynamic-programming` | `{ source, destinationIds }` -> exact TSP tour |
| POST | `/tsp/greedy` | `{ source, destinationIds }` -> greedy TSP tour |
| POST | `/tsp/dijkstra` | `{ source, destinationIds, k? }` -> graph-aware TSP tour |
| POST | `/ai/explain` | `{ context }` -> AI explanation of a real result |
| POST | `/ai/tutor` | `{ question, context }` -> AI tutor answer |
| POST | `/ai/compare` | `{ results }` -> AI comparison of 2+ real results |
| POST | `/ai/performance` | `{ metrics }` -> AI explanation of real measured performance |
| POST | `/ai/tsp-solve` | `{ source, destinationIds }` -> validated independent AI TSP route |
| GET | `/health` | Health check |

Every algorithm endpoint rebuilds the graph server-side from `{cityIds, k}` rather than trusting a
client-supplied graph, so results are always deterministic and reproducible.

## Security

- The OpenAI API key lives only in `server/.env` (gitignored) and is read via `process.env` inside
  `aiService.js` - it is never sent to, or reachable from, the browser.
- `helmet` sets standard security headers; `cors` restricts the API to the configured client origin.
- Separate rate limits: 120 req/min general API, 20 req/min for AI endpoints specifically.
- All inputs are validated (`server/middleware/validate.js`) before touching graph/algorithm code.
- Errors are normalized through a single error handler that never leaks stack traces or internal
  paths to the client.

## Testing

```bash
cd server
npm test
```

26 tests across 5 files cover: Dijkstra correctness (multi-hop shortest path, unreachable nodes,
source=destination, a textbook worked example), Prim correctness (MST weight, edge count,
disconnected graphs), Floyd-Warshall correctness (intermediate-vertex improvement, unreachable
pairs, cross-validation against Dijkstra), graph construction (Haversine distance sanity checks,
symmetric k-NN graph construction), and TSP correctness (dynamic programming and greedy source
return tours plus Dijkstra's independently calculated return leg).

## Known Limitations & Future Enhancements

- Distances are straight-line (Haversine), not road/flight distance - clearly disclosed throughout the UI.
- Floyd-Warshall's step *replay* is capped at 500 recorded updates for very large graphs (the
  underlying O(V^3) computation itself is always run in full and is never approximated).
- No persistent storage/accounts - state resets on page reload by design (kept intentionally simple).
- Possible future work: dynamic import/code-splitting for the frontend bundle, additional
  algorithms (A*, Kruskal, Bellman-Ford), exporting results as PDF/CSV, saved graph sessions.
#   T S P - a l g o r i t h m - a n a l i z e r  
 #   T S P - a l g o r i t h m - a n a l i z e r  
 