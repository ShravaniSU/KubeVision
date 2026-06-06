import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Sliders,
  RefreshCw,
  Terminal,
  GitBranch,
  Box,
  Cpu,
  Trash2,
  Calendar,
  Layers,
  Activity,
  Plus,
} from 'lucide-react';
import { useDeployment, useScaleDeployment, useRestartDeployment } from '../hooks/useDeployments';
import { useDeploymentReleases } from '../hooks/useReleases';
import { useDeploymentLogs } from '../hooks/useLogs';
import { useRestartPod, useDeletePod } from '../hooks/usePods';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Slider } from '../components/ui/Slider';
import { Spinner } from '../components/ui/Spinner';
import { useToast } from '../hooks/useToast';
import { PageTransition } from '../components/shared/PageTransition';

export const DeploymentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [scaleModalOpen, setScaleModalOpen] = useState(false);
  const [scaleReplicas, setScaleReplicas] = useState(1);

  const { data: deployment, isLoading, error } = useDeployment(id || '');
  const { data: releases } = useDeploymentReleases(id || '');
  const { data: logs } = useDeploymentLogs(id || '');

  const scaleMutation = useScaleDeployment();
  const restartMutation = useRestartDeployment();
  const restartPodMutation = useRestartPod();
  const deletePodMutation = useDeletePod();

  if (isLoading) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <Spinner size="lg" />
        <span style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading deployment config...</span>
      </div>
    );
  }

  if (error || !deployment) {
    return (
      <Card padding="lg" style={{ textAlign: 'center', color: 'var(--accent-red)' }}>
        <h3>Deployment not found</h3>
        <Button variant="outline" style={{ marginTop: '16px' }} onClick={() => navigate('/deployments')}>
          Back to Deployments
        </Button>
      </Card>
    );
  }

  const handleScaleSubmit = () => {
    scaleMutation.mutate({
      id: deployment.id,
      replicas: scaleReplicas,
    }, {
      onSuccess: () => {
        toast.success(`Target replicas set to ${scaleReplicas}`, 'Scaled successfully');
        setScaleModalOpen(false);
      }
    });
  };

  const handleIncrementReplica = () => {
    scaleMutation.mutate({
      id: deployment.id,
      replicas: deployment.replicas + 1,
    }, {
      onSuccess: () => {
        toast.success(`Incremented scale to ${deployment.replicas + 1}`, 'Replica added');
      }
    });
  };

  const handleRestart = () => {
    restartMutation.mutate(deployment.id, {
      onSuccess: () => {
        toast.success(`Restarting all active replicas of ${deployment.name}`, 'Rolling restart');
      }
    });
  };

  const handleRestartPod = (podId: string, podName: string) => {
    restartPodMutation.mutate(podId, {
      onSuccess: () => {
        toast.success(`Instructed container restart for ${podName}`, 'Pod Restarted');
      }
    });
  };

  const handleDeletePod = (podId: string, podName: string) => {
    deletePodMutation.mutate(podId, {
      onSuccess: () => {
        toast.success(`Pod ${podName} terminated. Re-scheduling replica.`, 'Pod Terminated');
      }
    });
  };

  const envVariant = deployment.environment.toLowerCase() === 'production' ? 'danger' : deployment.environment.toLowerCase() === 'staging' ? 'warning' : 'info';

  return (
    <PageTransition>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        {/* Back and Page Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => navigate('/deployments')}
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
            <ArrowLeft size={16} /> Back to Deployments
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {deployment.name}
                </h1>
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', padding: '2px 8px', backgroundColor: 'var(--bg-elevated)', borderRadius: '6px', border: '1px solid var(--border-default)', fontWeight: 600 }}>
                  {deployment.version}
                </span>
                <Badge variant={deployment.status === 'running' ? 'success' : 'warning'}>
                  {deployment.status.toUpperCase()}
                </Badge>
                <Badge variant={envVariant}>{deployment.environment.toUpperCase()}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Action controls row */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button variant="outline" onClick={() => { setScaleReplicas(deployment.replicas); setScaleModalOpen(true); }}>
            <Sliders size={14} style={{ marginRight: '6px' }} /> Scale Replicas
          </Button>
          <Button variant="outline" onClick={handleRestart}>
            <RefreshCw size={14} style={{ marginRight: '6px' }} /> Restart Deploy
          </Button>
          <Button variant="outline" onClick={() => navigate('/logs', { state: { deploymentName: deployment.name } })}>
            <Terminal size={14} style={{ marginRight: '6px' }} /> View Logs
          </Button>
          <Button variant="primary" onClick={() => navigate('/blue-green', { state: { deploymentId: deployment.id } })}>
            <GitBranch size={14} style={{ marginRight: '6px' }} /> Trigger Blue-Green
          </Button>
        </div>

        {/* 2-col content grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px', width: '100%', alignItems: 'start' }}>
          {/* Left Column: Pods */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Card padding="md" hover={false}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Replicas (Pods)</h3>
                  <Badge variant="info">{deployment.pods?.length || 0}</Badge>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {deployment.pods && deployment.pods.length > 0 ? (
                  deployment.pods.map((pod) => {
                    const isRunning = pod.status.toLowerCase() === 'running';
                    const isPending = pod.status.toLowerCase() === 'pending';
                    const isFailed = pod.status.toLowerCase() === 'failed' || pod.status.toLowerCase().includes('crash');

                    const statusColor = isRunning
                      ? 'var(--accent-green)'
                      : isPending
                      ? 'var(--accent-yellow)'
                      : 'var(--accent-red)';

                    return (
                      <div
                        key={pod.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--border-default)',
                          borderLeft: `4px solid ${statusColor}`,
                          borderRadius: 'var(--radius-md)',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {pod.name}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Cpu size={12} /> Node: {pod.nodeName || 'allocated'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Badge variant={isRunning ? 'success' : isFailed ? 'danger' : 'warning'}>
                            {pod.status}
                          </Badge>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <Button variant="ghost" size="sm" onClick={() => handleRestartPod(pod.id, pod.name)}>
                              <RefreshCw size={12} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeletePod(pod.id, pod.name)}>
                              <Trash2 size={12} color="var(--accent-red)" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No running pods found for this deployment.
                  </div>
                )}

                <Button variant="outline" fullWidth onClick={handleIncrementReplica} style={{ borderStyle: 'dashed', marginTop: '8px' }}>
                  <Plus size={14} style={{ marginRight: '6px' }} /> Scale Up (+1 Replica)
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column: Info & History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Deploy Info */}
            <Card padding="md" hover={false}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Deployment Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Target Image</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {deployment.image}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Replicas</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                    {deployment.replicas} target
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Cluster</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    {deployment.cluster?.name || 'Assigned'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Created Date</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {new Date(deployment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>

            {/* Releases History */}
            <Card padding="md" hover={false}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Release History</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {releases && releases.length > 0 ? (
                  releases.slice(0, 5).map((release, index) => (
                    <div key={release.id} style={{ display: 'flex', gap: '12px', fontSize: '13px', position: 'relative' }}>
                      {/* Left timeline bar */}
                      {index !== 4 && (
                        <div style={{ position: 'absolute', left: '7px', top: '16px', bottom: '-20px', width: '2px', backgroundColor: 'var(--border-subtle)' }} />
                      )}

                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--bg-elevated)', border: '2px solid var(--accent-blue)', display: 'flex', alignItems: 'center', justifySelf: 'center', zIndex: 1, marginTop: '2px' }} />

                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {release.version}
                          </span>
                          <Badge variant={release.status === 'succeeded' ? 'success' : 'danger'}>
                            {release.status}
                          </Badge>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Deployed {new Date(release.deployedAt).toLocaleTimeString()} · Traffic: {release.trafficPct}%
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No releases tracked</span>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Live Logs Mini Terminal */}
        <Card padding="md" hover={false}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Live Logs Preview</h3>
            <Link
              to="/logs"
              state={{ deploymentName: deployment.name }}
              style={{ fontSize: '13px', color: 'var(--accent-blue)', fontWeight: 600, textDecoration: 'none' }}
            >
              Open Full Logs →
            </Link>
          </div>

          <div
            style={{
              backgroundColor: '#0f1117',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              maxHeight: '240px',
              overflowY: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              lineHeight: 1.6,
              color: '#cbd5e1',
            }}
          >
            {logs && logs.length > 0 ? (
              logs.slice(-20).map((log) => {
                const colorMap = {
                  INFO: '#3b82f6',
                  WARN: '#f59e0b',
                  ERROR: '#ef4444',
                  DEBUG: '#94a3b8',
                };
                return (
                  <div key={log.id} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
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
              <div style={{ color: '#475569', textAlign: 'center', padding: '16px 0' }}>
                Streaming logs... waiting for container logs.
              </div>
            )}
          </div>
        </Card>

        {/* Scale Modal */}
        <AnimatePresence>
          {scaleModalOpen && (
            <Modal isOpen={true} onClose={() => setScaleModalOpen(false)} title={`Scale Deployment — ${deployment.name}`}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Current Replicas</div>
                  <div style={{ fontSize: '48px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {deployment.replicas}
                  </div>
                </div>

                <div style={{ width: '100%' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    Scale to: {scaleReplicas} replicas
                  </label>
                  <Slider min={1} max={20} value={scaleReplicas} onChange={(val) => setScaleReplicas(val)} />
                </div>

                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-blue)' }}>
                  {deployment.replicas} → {scaleReplicas} replicas
                </div>

                <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                  <Button variant="outline" fullWidth onClick={() => setScaleModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" fullWidth onClick={handleScaleSubmit} loading={scaleMutation.isPending}>
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
export default DeploymentDetail;
