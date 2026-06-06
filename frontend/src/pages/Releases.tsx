import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RotateCcw, Activity, ChevronDown, Rocket, Calendar, Clock } from 'lucide-react';
import { useClusterStore } from '../store/clusterStore';
import { useDeployments } from '../hooks/useDeployments';
import { useReleases } from '../hooks/useReleases';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { PageHeader } from '../components/layout/PageHeader';
import { PageTransition } from '../components/shared/PageTransition';

export const Releases: React.FC = () => {
  const { activeClusterId } = useClusterStore();
  const { data: deployments } = useDeployments(activeClusterId || '');
  const [selectedDeploymentId, setSelectedDeploymentId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'succeeded' | 'failed' | 'rolled_back'>('all');

  // Accordion open states
  const [expandedReleaseIds, setExpandedReleaseIds] = useState<string[]>([]);

  // Query
  const { data: releases, isLoading } = useReleases();

  const toggleExpand = (id: string) => {
    if (expandedReleaseIds.includes(id)) {
      setExpandedReleaseIds(expandedReleaseIds.filter((item) => item !== id));
    } else {
      setExpandedReleaseIds([...expandedReleaseIds, id]);
    }
  };

  // Local filter logic
  const filteredReleases = releases ? releases.filter((r) => {
    const matchesDeployment = selectedDeploymentId === 'all' || r.deploymentId === selectedDeploymentId;
    const matchesStatus = selectedStatus === 'all' || r.status.toLowerCase() === selectedStatus;
    return matchesDeployment && matchesStatus;
  }) : [];

  const getReleaseIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'succeeded':
        return (
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 2px 8px var(--accent-green-glow)' }}>
            <Check size={14} strokeWidth={3} />
          </div>
        );
      case 'failed':
        return (
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--accent-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 2px 8px var(--accent-red-glow)' }}>
            <X size={14} strokeWidth={3} />
          </div>
        );
      case 'rolled_back':
        return (
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--accent-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 2px 8px var(--accent-yellow-glow)' }}>
            <RotateCcw size={14} strokeWidth={3} />
          </div>
        );
      default:
        return (
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 2px 8px var(--accent-blue-glow)', animation: 'pulse-ring 1.5s infinite' }}>
            <Activity size={14} strokeWidth={3} />
          </div>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'succeeded': return <Badge variant="success">SUCCEEDED</Badge>;
      case 'failed': return <Badge variant="danger">FAILED</Badge>;
      case 'rolled_back': return <Badge variant="warning">ROLLED BACK</Badge>;
      default: return <Badge variant="info">ACTIVE</Badge>;
    }
  };

  return (
    <PageTransition>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <PageHeader
          title="Release Registry"
          subtitle="Audit logs and execution timelines for all canary promotions"
        />

        {/* Filters */}
        <Card padding="md" hover={false}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
            {/* Deployment dropdown */}
            <div style={{ width: '200px' }}>
              <Select
                value={selectedDeploymentId}
                onChange={(e) => setSelectedDeploymentId(e.target.value)}
                options={[
                  { value: 'all', label: 'All Services' },
                  ...(deployments?.map((d) => ({ value: d.id, label: d.name })) || []),
                ]}
                placeholder="Filter by Service"
              />
            </div>

            {/* Status filters */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['all', 'succeeded', 'failed', 'rolled_back'] as const).map((status) => {
                const isActive = selectedStatus === status;
                return (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: '1px solid var(--border-default)',
                      backgroundColor: isActive ? 'var(--accent-blue-light)' : '#ffffff',
                      color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {status.replace('_', ' ').toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Timeline body */}
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner size="lg" /></div>
        ) : filteredReleases.length === 0 ? (
          <Card padding="lg" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <Rocket size={48} style={{ margin: '0 auto 16px auto', color: 'var(--text-disabled)' }} />
            <h3>No promotional events recorded</h3>
            <p>Deploy a green replica or configure a pipeline flow to start logging releases.</p>
          </Card>
        ) : (
          <div style={{ position: 'relative', paddingLeft: '16px' }}>
            {/* Timeline center line */}
            <div
              style={{
                position: 'absolute',
                left: '29px',
                top: '12px',
                bottom: '12px',
                width: '2px',
                background: 'linear-gradient(to bottom, var(--accent-blue) 0%, var(--accent-violet) 100%)',
                zIndex: 0,
              }}
            />

            {/* Release items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {filteredReleases.map((release) => {
                const isExpanded = expandedReleaseIds.includes(release.id);
                return (
                  <div key={release.id} style={{ display: 'flex', gap: '20px', position: 'relative', zIndex: 1 }}>
                    {/* Left node point */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: '10px' }}>
                      {getReleaseIcon(release.status)}
                    </div>

                    {/* Timeline card content */}
                    <Card
                      padding="none"
                      hover={false}
                      style={{
                        flex: 1,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        boxShadow: 'var(--card-shadow)',
                      }}
                      onClick={() => toggleExpand(release.id)}
                    >
                      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', padding: '2px 6px', backgroundColor: 'var(--bg-elevated)', borderRadius: '4px', border: '1px solid var(--border-default)', fontWeight: 600 }}>
                            {release.version}
                          </span>
                          {getStatusBadge(release.status)}
                          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {release.deploymentName || 'microservice'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                            <Calendar size={12} /> {new Date(release.deployedAt).toLocaleDateString()}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                            <Clock size={12} /> {new Date(release.deployedAt).toLocaleTimeString()}
                          </div>
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ display: 'flex', color: 'var(--text-secondary)' }}
                          >
                            <ChevronDown size={18} />
                          </motion.div>
                        </div>
                      </div>

                      {/* Expandable Panel */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ padding: '0 20px 20px 20px', borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-elevated)', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '12px' }}>
                                <div>
                                  <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Routing Allocation</span>
                                  <strong>Traffic: {release.trafficPct}%</strong>
                                </div>
                                <div>
                                  <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Canary Type</span>
                                  <strong>{release.color?.toUpperCase() || 'STANDARD'} deployment</strong>
                                </div>
                                <div>
                                  <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Release ID</span>
                                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{release.id}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};
export default Releases;
