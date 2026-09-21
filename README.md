Intelligent Graph Algorithm Analyzer
A web-based DAA/CCP project that analyzes graph algorithms and solves the Travelling Salesman Problem (TSP) using multiple algorithmic approaches and AI.
🔹 Key Features
•	🌍 Real-World City Dataset — Uses global city data containing coordinates, countries, population, and other geographical information.
•	🔎 City Search — Search and select cities dynamically from the dataset.
•	🧮 Dynamic Programming — Solves TSP using a Dynamic Programming approach.
•	⚡ Greedy Algorithm — Generates a fast approximate TSP route.
•	📍 Dijkstra Algorithm — Uses shortest-path calculations within the TSP route.
•	🤖 AI/LLM Solver — Provides AI-based TSP solving, explanations, comparisons, and performance analysis.
•	🗺️ Graph Workspace — Visualizes the selected cities, connections, and calculated routes.
•	📊 Performance Analysis — Displays route distance and actual algorithm execution time.
🔹 How It Works
The system follows this general process:
1. Select Cities
The user searches the global dataset and selects a source city and destinations.
2. Generate Graph
The backend calculates distances between the selected cities using their latitude and longitude.
3. Calculate Distance
Distances are calculated using the Haversine Formula to determine geographical distance in kilometers.
4. Run Algorithms
The selected algorithm calculates a route:
•	Dynamic Programming
•	Greedy
•	Dijkstra
•	AI/LLM
5. Complete the Tour
The TSP route follows:
Source → Destination(s) → Source
The return journey is calculated as part of the tour rather than simply reversing the outgoing route.
6. Display Results
The application displays:
•	Calculated route
•	Total distance
•	Execution time
•	Graph visualization
•	Algorithm-specific results

Architecture
User
  ↓
React Frontend
  ↓
Express Backend API
  ↓
City Dataset
  ↓
Graph & Distance Calculation
  ↓
Algorithms / AI Solver
  ↓
Results & Visualization

Technologies
Frontend
•	React
•	Vite
•	JavaScript
•	Tailwind CSS
Backend
•	Node.js
•	Express.js
•	JavaScript
AI
•	OpenAI API
Deployment
•	GitHub
•	Vercel

Live Project
Frontend:
https://tsp-algorithm-analizer-gien.vercel.app/
Backend:
https://tsp-algorithm-analizer.vercel.app/

Author
Muhammad Ahmed 
LinkedIn: https://www.linkedin.com/in/Muhammad-Ahmed-201ba1344/

