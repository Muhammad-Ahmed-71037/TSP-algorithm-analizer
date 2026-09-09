import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Dataset from './pages/Dataset';
import GraphWorkspace from './pages/GraphWorkspace';
import TSPAlgorithm from './pages/TSPAlgorithm';
import Compare from './pages/Compare';
import Complexity from './pages/Complexity';
import AIAnalyst from './pages/AIAnalyst';
import About from './pages/About';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dataset" element={<Dataset />} />
        <Route path="/graph" element={<GraphWorkspace />} />
        <Route path="/tsp" element={<TSPAlgorithm algorithm="dynamicProgramming" />} />
        <Route path="/dynamic-programming" element={<TSPAlgorithm algorithm="dynamicProgramming" />} />
        <Route path="/greedy" element={<TSPAlgorithm algorithm="greedy" />} />
        <Route path="/dijkstra" element={<TSPAlgorithm algorithm="dijkstraTSP" />} />
        <Route path="/ai-tsp" element={<TSPAlgorithm algorithm="aiTSP" />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/ai-analyst" element={<AIAnalyst />} />
        <Route path="/complexity" element={<Complexity />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
