import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Terminal, Download, ArrowDown, Cpu } from 'lucide-react';
import { useClusterStore } from '../store/clusterStore';
import { useDeployments } from '../hooks/useDeployments';
import { usePods } from '../hooks/usePods';
import { useLogs } from '../hooks/useLogs';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/layout/PageHeader';
import { PageTransition } from '../components/shared/PageTransition';

type LogLevel = 'ALL' | 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export const Logs: React.FC = () => {
  const location = useLocation();
  const { activeClusterId } = useClusterStore();
  const { data: deployments } = useDeployments(activeClusterId || '');

  // Pre-filled state from navigation (e.g. from DeploymentDetail / Pods)
  const initialDeploymentName = location.state?.deploymentName || '';

  // Selectors
  const [selectedDeploymentId, setSelectedDeploymentId] = useState('');
  const [selectedPodId, setSelectedPodId] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<LogLevel>('ALL');
  const [autoScroll, setAutoScroll] = useState(true);

  // Queries
  const { data: pods } = usePods(selectedDeploymentId);
  const { data: logs, isLoading: isLogsLoading } = useLogs(
    selectedPodId,
    selectedLevel === 'ALL' ? undefined : selectedLevel
  );

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Sync initial deployment by name if passed via router state
  useEffect(() => {
    if (deployments && deployments.length > 0) {
      if (initialDeploymentName) {
        const found = deployments.find((d) => d.name === initialDeploymentName);
        if (found) {
          setSelectedDeploymentId(found.id);
          return;
        }
      }
      if (!selectedDeploymentId) {
        setSelectedDeploymentId(deployments[0].id);
      }
    }
  }, [deployments, initialDeploymentName]);

  // Auto-select first pod when pods load
  useEffect(() => {
    if (pods && pods.length > 0) {
      setSelectedPodId(pods[0].id);
    } else {
      setSelectedPodId('');
    }
  }, [pods]);

  // Scroll to bottom effect
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Export logs to txt file
  const handleExportLogs = () => {
    if (!logs || logs.length === 0) return;
    const activePod = pods?.find((p) => p.id === selectedPodId);
    const content = logs
      .map((log) => `[${new Date(log.createdAt).toISOString()}] [${log.level}] ${log.message}`)
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-${activePod?.name || 'pod'}-${new Date().toISOString()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getLevelPillStyle = (level: LogLevel) => {
    const isActive = selectedLevel === level;
    let baseColor = 'var(--text-secondary)';
    let activeBg = 'var(--accent-blue-light)';
    let activeBorder = 'var(--accent-blue)';

    if (level === 'INFO') {
      baseColor = 'var(--accent-blue)';
      activeBg = 'rgba(59, 130, 246, 0.15)';
      activeBorder = '#3b82f6';
    } else if (level === 'WARN') {
      baseColor = 'var(--accent-yellow)';
      activeBg = 'rgba(245, 158, 11, 0.15)';
      activeBorder = '#f59e0b';
    } else if (level === 'ERROR') {
      baseColor = 'var(--accent-red)';
      activeBg = 'rgba(239, 68, 68, 0.15)';
      activeBorder = '#ef4444';
    } else if (level === 'DEBUG') {
      baseColor = '#64748b';
      activeBg = 'rgba(100, 116, 139, 0.15)';
      activeBorder = '#64748b';
    } else if (level === 'ALL') {
      baseColor = 'var(--text-primary)';
      activeBg = 'var(--bg-elevated)';
      activeBorder = 'var(--border-strong)';
    }

    return {
      padding: '6px 14px',
      borderRadius: '20px',
      border: `1px solid ${isActive ? activeBorder : 'var(--border-default)'}`,
      backgroundColor: isActive ? activeBg : '#ffffff',
      color: baseColor,
      fontWeight: 600,
      fontSize: '12px',
      cursor: 'pointer',
      transition: 'all var(--transition-fast)',
    };
  };

  const activePodName = pods?.find((p) => p.id === selectedPodId)?.name || 'Select Pod';

  return (
    <PageTransition>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <PageHeader
          title="Terminal Logs"
          subtitle="Real-time log aggregator stream for containers and pods"
        />

        {/* Filter bar */}
        <Card padding="md" hover={false}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
            {/* Deployment */}
            <div style={{ width: '180px' }}>
              <Select
                value={selectedDeploymentId}
                onChange={(e) => setSelectedDeploymentId(e.target.value)}
                options={
                  deployments?.map((d) => ({
                    value: d.id,
                    label: d.name,
                  })) || []
                }
                placeholder="Deployment"
              />
            </div>

            {/* Pod Selector */}
            <div style={{ width: '220px' }}>
              <Select
                value={selectedPodId}
                onChange={(e) => setSelectedPodId(e.target.value)}
                options={
                  pods?.map((p) => ({
                    value: p.id,
                    label: p.name,
                  })) || []
                }
                placeholder="Select Pod Replica"
                disabled={!selectedDeploymentId}
              />
            </div>

            {/* Level Selector Pills */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG'] as LogLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  style={getLevelPillStyle(lvl)}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Controls */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '14px' }}>
              {/* Auto Scroll toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                Auto-scroll
              </label>

              {/* Exporter button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportLogs}
                disabled={!logs || logs.length === 0}
                style={{ height: '36px' }}
              >
                <Download size={14} style={{ marginRight: '6px' }} /> Export
              </Button>
            </div>
          </div>
        </Card>

        {/* Terminal frame */}
        <Card padding="none" hover={false} style={{ borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* Header Bar */}
          <div
            style={{
              backgroundColor: '#0b0f19',
              padding: '12px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #1e293b',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', fontSize: '13px', fontWeight: 700 }}>
              <Terminal size={16} color="var(--accent-blue)" />
              <span>Log Stream: <span style={{ fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>{activePodName}</span></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-green)',
                  animation: 'pulse-ring 1.5s infinite',
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 700, letterSpacing: '0.05em' }}>
                STREAMING
              </span>
            </div>
          </div>

          {/* Terminal Console */}
          <div
            style={{
              backgroundColor: '#050810',
              padding: '20px',
              height: '500px',
              overflowY: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              lineHeight: 1.6,
              color: '#e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {isLogsLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', color: '#64748b' }}>
                <Spinner size="md" />
                <span>Reading standard outputs...</span>
              </div>
            ) : logs && logs.length > 0 ? (
              <>
                {logs.map((log) => {
                  let tagColor = '#3b82f6';
                  if (log.level === 'WARN') tagColor = '#f59e0b';
                  if (log.level === 'ERROR') tagColor = '#ef4444';
                  if (log.level === 'DEBUG') tagColor = '#64748b';

                  return (
                    <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      {/* Timestamp */}
                      <span style={{ color: '#475569', flexShrink: 0 }}>
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                      {/* Level Tag */}
                      <span style={{ color: tagColor, fontWeight: 700, flexShrink: 0, width: '56px' }}>
                        [{log.level}]
                      </span>
                      {/* Message Content */}
                      <span style={{ wordBreak: 'break-all' }}>{log.message}</span>
                    </div>
                  );
                })}
                {/* Scroll Target Anchor */}
                <div ref={terminalEndRef} />
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569', gap: '8px' }}>
                <Cpu size={32} />
                <span>No active stdout logs streaming for this pod replica.</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </PageTransition>
  );
};
export default Logs;
