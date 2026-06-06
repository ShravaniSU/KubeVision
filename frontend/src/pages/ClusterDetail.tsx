import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Box, Rocket, ArrowLeft, Activity, RefreshCw, Trash2, Sliders } from 'lucide-react';
import { useCluster } from '../hooks/useClusters';
import { useMetricsHistory } from '../hooks/useMetrics';
import { useScaleDeployment, useRestartDeployment } from '../hooks/useDeployments';
import { useRestartPod, useDeletePod } from '../hooks/usePods';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { MetricBar } from '../components/ui/MetricBar';
import { StatusDot } from '../components/ui/StatusDot';
import { Modal } from '../components/ui/Modal';
import { Slider } from '../components/ui/Slider';
import { useToast } from '../hooks/useToast';
import { PageTransition } from '../components/shared/PageTransition';
import {
  AreaChart as _AreaChart,
  Area as _Area,
  ResponsiveContainer as _ResponsiveContainer,
  XAxis as _XAxis,
  YAxis as _YAxis,
  Tooltip as _ChartTooltip,
  CartesianGrid as _CartesianGrid,
} from 'recharts';

const AreaChart = _AreaChart as any;
const Area = _Area as any;
const ResponsiveContainer = _ResponsiveContainer as any;
const XAxis = _XAxis as any;
const YAxis = _YAxis as any;
const ChartTooltip = _ChartTooltip as any;
const CartesianGrid = _CartesianGrid as any;

export const ClusterDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'nodes' | 'deployments' | 'pods'>('overview');

  // Scale Modal State
  const [selectedScaleDeployment, setSelectedScaleDeployment] = useState<{ id: string; name: string; replicas: number } | null>(null);
  const [scaleReplicas, setScaleReplicas] = useState(1);

  const { data: cluster, isLoading, error } = useCluster(id || '');
  const { data: historyMetrics } = useMetricsHistory(id || '', 24);

  const scaleMutation = useScaleDeployment();
  const restartDepMutation = useRestartDeployment();
  const restartPodMutation = useRestartPod();
  const deletePodMutation = useDeletePod();

  if (isLoading) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <Spinner size="lg" />
        <span style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading cluster details...</span>
      </div>
    );
  }

  if (error || !cluster) {
    return (
      <Card padding="lg" style={{ textAlign: 'center', color: 'var(--accent-red)' }}>
        <h3>Cluster not found</h3>
        <p style={{ color: 'var(--text-secondary)' }}>We couldn't retrieve the details for this cluster.</p>
        <Button variant="outline" style={{ marginTop: '16px' }} onClick={() => navigate('/clusters')}>
          Back to Clusters
        </Button>
      </Card>
    );
  }

  // Aggregate stats
  const totalPods = cluster.deployments?.flatMap((d) => d.pods || []) || [];
  const averageCpu = Math.round(
    cluster.nodes?.reduce((acc, n) => acc + n.cpuUsage, 0) / (cluster.nodes?.length || 1)
  );

  const chartData = historyMetrics?.map((m) => ({
    time: new Date(m.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    cpu: Math.round(m.cpuUsage),
    memory: Math.round(m.memoryUsage),
  })) || Array.from({ length: 12 }, (_, i) => ({
    time: `${i * 2}:00`,
    cpu: Math.floor(Math.random() * 30) + 30,
    memory: Math.floor(Math.random() * 20) + 40,
  }));

  const handleScaleSubmit = () => {
    if (selectedScaleDeployment) {
      scaleMutation.mutate(
        { id: selectedScaleDeployment.id, replicas: scaleReplicas },
        {
          onSuccess: () => {
            toast.success(`Successfully scaled ${selectedScaleDeployment.name} to ${scaleReplicas} replicas.`, 'Deployment Scaled');
            setSelectedScaleDeployment(null);
          },
          onError: () => {
            toast.error('Failed to scale the deployment. Please try again.', 'Scaling Failed');
          },
        }
      );
    }
  };

  const handleRestartDeployment = (depId: string, depName: string) => {
    restartDepMutation.mutate(depId, {
      onSuccess: () => {
        toast.success(`Rolling restart started for deployment ${depName}.`, 'Restart Triggered');
      },
    });
  };

  const handleRestartPod = (podId: string, podName: string) => {
    restartPodMutation.mutate(podId, {
      onSuccess: () => {
        toast.success(`Pod ${podName} was successfully restarted.`, 'Pod Restarted');
      },
    });
  };

  const handleDeletePod = (podId: string, podName: string) => {
    deletePodMutation.mutate(podId, {
      onSuccess: () => {
        toast.success(`Pod ${podName} terminated. A new replica will spin up.`, 'Pod Terminated');
      },
    });
  };

  const getEnvBadge = (env: string) => {
    switch (env.toLowerCase()) {
      case 'production': return <Badge variant="danger">PROD</Badge>;
      case 'staging': return <Badge variant="warning">STG</Badge>;
      default: return <Badge variant="info">DEV</Badge>;
    }
  };

  return (
    <PageTransition>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        {/* Back and Page Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => navigate('/clusters')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              width: 'fit-content',
            }}
          >
            <ArrowLeft size={16} /> Back to Clusters
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {cluster.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                {getEnvBadge(cluster.environment)}
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  📍 {cluster.region}
                </span>
                <span style={{ color: 'var(--border-strong)' }}>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <StatusDot status={cluster.status.toLowerCase() === 'healthy' ? 'healthy' : 'failed'} size="sm" />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {cluster.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Quick-Stat Mini-Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <StatCard title="Nodes" value={cluster.nodes?.length || 0} icon={Cpu} gradient="var(--icon-bg-blue)" glow="var(--accent-blue-glow)" />
          <StatCard title="Pods" value={totalPods.length} icon={Box} gradient="var(--icon-bg-green)" glow="var(--accent-green-glow)" />
          <StatCard title="Deployments" value={cluster.deployments?.length || 0} icon={Rocket} gradient="var(--icon-bg-violet)" glow="var(--accent-violet-glow)" />
          <StatCard title="Avg CPU" value={`${averageCpu}%`} icon={Activity} gradient="var(--icon-bg-yellow)" glow="var(--accent-yellow-glow)" />
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-default)', gap: '24px' }}>
          {(['overview', 'nodes', 'deployments', 'pods'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 8px',
                  border: 'none',
                  background: 'transparent',
                  fontFamily: 'var(--font-display)',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  borderBottom: isActive ? '2px solid var(--accent-blue)' : '2px solid transparent',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div style={{ width: '100%' }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
              <Card padding="md" hover={false}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                  CPU Load History
                </h3>
                <div style={{ width: '100%', height: '220px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                      <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                      <ChartTooltip />
                      <Area type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} fillOpacity={0.15} fill="#3b82f6" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card padding="md" hover={false}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                  Memory Utilization History
                </h3>
                <div style={{ width: '100%', height: '220px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                      <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                      <ChartTooltip />
                      <Area type="monotone" dataKey="memory" stroke="#8b5cf6" strokeWidth={2} fillOpacity={0.15} fill="#8b5cf6" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'nodes' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {cluster.nodes?.map((node) => (
                <Card key={node.id} padding="md">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                      {node.name}
                    </span>
                    <Badge variant={node.status === 'ready' ? 'success' : 'danger'}>
                      {node.status === 'ready' ? 'Ready' : 'Not Ready'}
                    </Badge>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <MetricBar label="CPU Usage" value={node.cpuUsage} />
                    <MetricBar label="Memory Usage" value={node.memoryUsage} />
                    <MetricBar label="Disk Space" value={node.diskUsage} />
                  </div>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'deployments' && (
            <Card padding="none" hover={false} style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-default)', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    <th style={{ padding: '12px 20px' }}>NAME</th>
                    <th style={{ padding: '12px 20px' }}>IMAGE</th>
                    <th style={{ padding: '12px 20px' }}>VERSION</th>
                    <th style={{ padding: '12px 20px' }}>REPLICAS</th>
                    <th style={{ padding: '12px 20px' }}>STATUS</th>
                    <th style={{ padding: '12px 20px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {cluster.deployments?.map((dep) => (
                    <tr key={dep.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '13px' }}>
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-primary)' }}>{dep.name}</td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                        {dep.image}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', padding: '2px 6px', backgroundColor: 'var(--bg-elevated)', borderRadius: '4px' }}>
                          {dep.version}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 600 }}>{dep.replicas}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <Badge variant={dep.status === 'running' ? 'success' : 'warning'}>
                          {dep.status}
                        </Badge>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedScaleDeployment({ id: dep.id, name: dep.name, replicas: dep.replicas });
                              setScaleReplicas(dep.replicas);
                            }}
                          >
                            <Sliders size={14} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleRestartDeployment(dep.id, dep.name)}>
                            <RefreshCw size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {activeTab === 'pods' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
              {totalPods.map((pod) => {
                const isRunning = pod.status.toLowerCase() === 'running';
                const isPending = pod.status.toLowerCase() === 'pending';
                const isFailed = pod.status.toLowerCase() === 'failed' || pod.status.toLowerCase().includes('crash');

                const statusColor = isRunning
                  ? 'var(--accent-green)'
                  : isPending
                  ? 'var(--accent-yellow)'
                  : 'var(--accent-red)';

                return (
                  <Card
                    key={pod.id}
                    padding="md"
                    style={{
                      borderLeft: `3px solid ${statusColor}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          wordBreak: 'break-all',
                        }}
                      >
                        {pod.name}
                      </span>
                      <Badge variant={isRunning ? 'success' : isFailed ? 'danger' : 'warning'}>
                        {pod.status}
                      </Badge>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: 'auto' }}>
                      <Button variant="ghost" size="sm" onClick={() => handleRestartPod(pod.id, pod.name)}>
                        <RefreshCw size={12} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeletePod(pod.id, pod.name)}>
                        <Trash2 size={12} color="var(--accent-red)" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Scale Deployment Modal */}
        <AnimatePresence>
          {selectedScaleDeployment && (
            <Modal isOpen={true} onClose={() => setSelectedScaleDeployment(null)} title={`Scale Deployment — ${selectedScaleDeployment.name}`}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '10px 0' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Current Replicas</div>
                  <div style={{ fontSize: '48px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {selectedScaleDeployment.replicas}
                  </div>
                </div>

                <div style={{ width: '100%' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    Scale to: {scaleReplicas} replicas
                  </label>
                  <Slider min={1} max={20} value={scaleReplicas} onChange={(val) => setScaleReplicas(val)} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--accent-blue)' }}>
                  <span>{selectedScaleDeployment.replicas}</span>
                  <span>→</span>
                  <span>{scaleReplicas} replicas</span>
                </div>

                <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '12px' }}>
                  <Button variant="outline" fullWidth onClick={() => setSelectedScaleDeployment(null)}>
                    Cancel
                  </Button>
                  <Button variant="primary" fullWidth onClick={handleScaleSubmit}>
                    Confirm Scale
                  </Button>
                </div>
              </div>
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};
export default ClusterDetail;
