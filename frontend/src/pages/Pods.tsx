import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Terminal, RefreshCw, Trash2, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useClusterStore } from '../store/clusterStore';
import { useDeployments } from '../hooks/useDeployments';
import { usePods, useRestartPod, useDeletePod } from '../hooks/usePods';
import { useLogs } from '../hooks/useLogs';
import { useNodes } from '../hooks/useNodes';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { useToast } from '../hooks/useToast';
import { PageHeader } from '../components/layout/PageHeader';
import { PageTransition } from '../components/shared/PageTransition';

export const Pods: React.FC = () => {
  const toast = useToast();
  const { activeClusterId } = useClusterStore();
  const { data: deployments } = useDeployments(activeClusterId || '');
  const { data: nodes } = useNodes(activeClusterId || '');

  const [selectedDeploymentId, setSelectedDeploymentId] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState('all');
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);

  // Selection for Drawer & Modal
  const [drawerPod, setDrawerPod] = useState<{ id: string; name: string; status: string } | null>(null);
  const [deletePod, setDeletePod] = useState<{ id: string; name: string } | null>(null);

  // Queries
  const { data: pods, isLoading } = usePods(selectedDeploymentId);
  const { data: logs, isLoading: isLogsLoading } = useLogs(drawerPod?.id || '', undefined, 100);

  const restartMutation = useRestartPod();
  const deleteMutation = useDeletePod();

  // Set default deployment selection
  useEffect(() => {
    if (deployments && deployments.length > 0 && !selectedDeploymentId) {
      setSelectedDeploymentId(deployments[0].id);
    }
  }, [deployments, selectedDeploymentId]);

  const toggleStatusFilter = (status: string) => {
    if (filterStatuses.includes(status)) {
      setFilterStatuses(filterStatuses.filter((s) => s !== status));
    } else {
      setFilterStatuses([...filterStatuses, status]);
    }
  };

  const handleRestart = (id: string, name: string) => {
    restartMutation.mutate(id, {
      onSuccess: () => {
        toast.success(`Successfully restarted pod ${name}.`, 'Pod Restarted');
      }
    });
  };

  const handleDeleteSubmit = () => {
    if (deletePod) {
      deleteMutation.mutate(deletePod.id, {
        onSuccess: () => {
          toast.success(`Deleted pod ${deletePod.name}.`, 'Pod Terminated');
          setDeletePod(null);
        }
      });
    }
  };

  // Local filter logic
  const filteredPods = pods ? pods.filter((pod) => {
    const matchesNode = selectedNodeId === 'all' || pod.nodeId === selectedNodeId;
    const matchesStatus = filterStatuses.length === 0 || filterStatuses.includes(pod.status.toLowerCase());
    return matchesNode && matchesStatus;
  }) : [];

  return (
    <PageTransition>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', position: 'relative' }}>
        <PageHeader
          title="Pod Explorer"
          subtitle="Inspect and manage individual containerized replica sets"
        />

        {/* Filter bar */}
        <Card padding="md" hover={false}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
            {/* Deployment selection */}
            <div style={{ width: '220px' }}>
              <Select
                value={selectedDeploymentId}
                onChange={(e) => setSelectedDeploymentId(e.target.value)}
                options={
                  deployments?.map((d) => ({
                    value: d.id,
                    label: d.name,
                  })) || []
                }
                placeholder="Select Deployment"
              />
            </div>

            {/* Node selection */}
            <div style={{ width: '180px' }}>
              <Select
                value={selectedNodeId}
                onChange={(e) => setSelectedNodeId(e.target.value)}
                options={[
                  { value: 'all', label: 'All Nodes' },
                  ...(nodes?.map((n) => ({ value: n.id, label: n.name })) || []),
                ]}
                placeholder="Filter by Node"
              />
            </div>

            {/* Status multi-chips */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['running', 'pending', 'failed'].map((status) => {
                const isActive = filterStatuses.includes(status);
                const colorMap: Record<string, string> = {
                  running: 'var(--accent-green)',
                  pending: 'var(--accent-yellow)',
                  failed: 'var(--accent-red)',
                };
                return (
                  <button
                    key={status}
                    onClick={() => toggleStatusFilter(status)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      border: `1px solid ${isActive ? colorMap[status] : 'var(--border-default)'}`,
                      backgroundColor: isActive ? `${colorMap[status]}15` : '#ffffff',
                      color: isActive ? colorMap[status] : 'var(--text-secondary)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {status.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Pod Grid */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
            <Spinner size="lg" />
            <span style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Retrieving pods...</span>
          </div>
        ) : filteredPods.length === 0 ? (
          <Card padding="lg" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <h3>No Pods Found</h3>
            <p>Ensure that the deployment has active replicas or adjust your filters.</p>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {filteredPods.map((pod) => {
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
                    borderLeft: `4px solid ${statusColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    position: 'relative',
                    animation: isFailed ? 'pulse-border 2s infinite' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        fontWeight: 700,
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

                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Node: <strong>{pod.nodeName || 'allocated'}</strong>
                    </span>
                    <span>
                      Created: {new Date(pod.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: '4px' }}>
                    <Button variant="ghost" size="sm" onClick={() => setDrawerPod(pod)}>
                      <Terminal size={12} style={{ marginRight: '4px' }} /> Logs
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleRestart(pod.id, pod.name)}>
                      <RefreshCw size={12} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeletePod(pod)}>
                      <Trash2 size={12} color="var(--accent-red)" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deletePod && (
            <Modal isOpen={true} onClose={() => setDeletePod(null)} title="Delete Pod?">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--accent-red-light)', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Are you sure?</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    This will terminate the pod <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{deletePod.name}</span> instantly. The deployment controller will schedule a new container replica.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <Button variant="outline" fullWidth onClick={() => setDeletePod(null)}>
                    Cancel
                  </Button>
                  <Button variant="danger" fullWidth onClick={handleDeleteSubmit} loading={deleteMutation.isPending}>
                    Terminate Pod
                  </Button>
                </div>
              </div>
            </Modal>
          )}
        </AnimatePresence>

        {/* Slide-out Log Drawer */}
        <AnimatePresence>
          {drawerPod && (
            <>
              {/* Overlay Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                onClick={() => setDrawerPod(null)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: '#000000',
                  zIndex: 998,
                }}
              />

              {/* Log Panel */}
              <motion.div
                initial={{ x: 480 }}
                animate={{ x: 0 }}
                exit={{ x: 480 }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                style={{
                  position: 'fixed',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: '480px',
                  backgroundColor: '#ffffff',
                  boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
                  zIndex: 999,
                  display: 'flex',
                  flexDirection: 'column',
                  borderLeft: '1px solid var(--border-default)',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: '20px',
                    borderBottom: '1px solid var(--border-default)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                      Logs: {drawerPod.name}
                    </span>
                    <Badge variant={drawerPod.status.toLowerCase() === 'running' ? 'success' : 'warning'}>
                      {drawerPod.status.toUpperCase()}
                    </Badge>
                  </div>
                  <button
                    onClick={() => setDrawerPod(null)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Log Terminal Window */}
                <div
                  style={{
                    flex: 1,
                    backgroundColor: '#0f1117',
                    padding: '16px',
                    overflowY: 'auto',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    lineHeight: 1.6,
                    color: '#cbd5e1',
                  }}
                >
                  {isLogsLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Spinner size="md" />
                    </div>
                  ) : logs && logs.length > 0 ? (
                    logs.map((log) => {
                      const colorMap: Record<string, string> = {
                        INFO: '#3b82f6',
                        WARN: '#f59e0b',
                        ERROR: '#ef4444',
                        DEBUG: '#94a3b8',
                      };
                      return (
                        <div key={log.id} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ color: '#475569', flexShrink: 0 }}>
                            [{new Date(log.createdAt).toLocaleTimeString()}]
                          </span>
                          <span style={{ color: colorMap[log.level] || 'var(--text-muted)', fontWeight: 700, flexShrink: 0 }}>
                            [{log.level}]
                          </span>
                          <span style={{ wordBreak: 'break-all' }}>{log.message}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ color: '#475569', textAlign: 'center', paddingTop: '40px' }}>
                      No container logs received.
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};
export default Pods;
