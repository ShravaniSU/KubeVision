import React, { useEffect, useState } from 'react';
import { useClusters } from '../../hooks/useClusters';
import { useClusterStore } from '../../store/clusterStore';
import { StatusDot } from '../ui/StatusDot';

export const StatusBar: React.FC = () => {
  const { data: clusters } = useClusters();
  const { activeClusterId } = useClusterStore();
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    setLastUpdated(
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
  }, [clusters]);

  const activeCluster = clusters?.find((c) => c.id === activeClusterId) || clusters?.[0];

  const totalClusters = clusters?.length || 0;
  const healthyClusters = clusters?.filter((c) => c.status.toLowerCase() === 'healthy').length || 0;

  const nodeCount = activeCluster ? activeCluster.nodeCount : 0;
  const podCount = activeCluster ? activeCluster.podCount : 0;
  const deploymentCount = activeCluster ? activeCluster.deploymentCount : 0;

  const statusText =
    healthyClusters === totalClusters
      ? 'All Systems Operational'
      : `${totalClusters - healthyClusters} Cluster(s) degraded`;

  const statusType = healthyClusters === totalClusters ? 'healthy' : 'warning';

  return (
    <footer
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 28px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--border-default)',
        fontSize: '12px',
        color: 'var(--text-secondary)',
        fontWeight: 500,
        gap: '24px',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <StatusDot status={statusType} size="sm" />
        <span>System Status: <strong>{statusText}</strong></span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Clusters: <strong>{healthyClusters}/{totalClusters} Healthy</strong></span>
        </div>
        <span style={{ color: 'var(--border-strong)' }}>|</span>
        <div>
          <span>Nodes: <strong>{nodeCount} Online</strong></span>
        </div>
        <span style={{ color: 'var(--border-strong)' }}>|</span>
        <div>
          <span>Pods: <strong>{podCount} Running</strong></span>
        </div>
        <span style={{ color: 'var(--border-strong)' }}>|</span>
        <div>
          <span>Deployments: <strong>{deploymentCount} Total</strong></span>
        </div>
        <span style={{ color: 'var(--border-strong)' }}>|</span>
        <div>
          <span>Last Updated: <strong>{lastUpdated || 'Loading...'}</strong></span>
        </div>
      </div>
    </footer>
  );
};
export default StatusBar;
