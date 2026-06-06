import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Clusters } from './pages/Clusters';
import { ClusterDetail } from './pages/ClusterDetail';
import { Nodes } from './pages/Nodes';
import { Deployments } from './pages/Deployments';
import { DeploymentDetail } from './pages/DeploymentDetail';
import { BlueGreen } from './pages/BlueGreen';
import { Pods } from './pages/Pods';
import { Logs } from './pages/Logs';
import { Metrics } from './pages/Metrics';
import { Releases } from './pages/Releases';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="clusters" element={<Clusters />} />
          <Route path="clusters/:id" element={<ClusterDetail />} />
          <Route path="nodes" element={<Nodes />} />
          <Route path="deployments" element={<Deployments />} />
          <Route path="deployments/:id" element={<DeploymentDetail />} />
          <Route path="blue-green" element={<BlueGreen />} />
          <Route path="pods" element={<Pods />} />
          <Route path="logs" element={<Logs />} />
          <Route path="metrics" element={<Metrics />} />
          <Route path="releases" element={<Releases />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

