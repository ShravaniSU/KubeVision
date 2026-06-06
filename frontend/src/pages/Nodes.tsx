import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, List, ArrowUpDown } from 'lucide-react';
import { useClusterStore } from '../store/clusterStore';
import { useClusters } from '../hooks/useClusters';
import { useNodes } from '../hooks/useNodes';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { MetricBar } from '../components/ui/MetricBar';
import { Spinner } from '../components/ui/Spinner';
import { PageHeader } from '../components/layout/PageHeader';
import { PageTransition } from '../components/shared/PageTransition';

type SortField = 'name' | 'cpuUsage' | 'memoryUsage' | 'diskUsage' | 'podCount';
type SortOrder = 'asc' | 'desc';

export const Nodes: React.FC = () => {
  const { activeClusterId, setActiveCluster } = useClusterStore();
  const { data: clusters } = useClusters();
  const { data: nodes, isLoading } = useNodes(activeClusterId || '');

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedNodes = nodes ? [...nodes].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
  }) : [];

  const activeCluster = clusters?.find((c) => c.id === activeClusterId);

  return (
    <PageTransition>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        {/* Header section */}
        <PageHeader
          title="Node Monitor"
          subtitle="Real-time telemetry and resource usage per physical node"
          actions={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Cluster Filter */}
              <div style={{ width: '180px' }}>
                <Select
                  value={activeClusterId || ''}
                  onChange={(e) => setActiveCluster(e.target.value)}
                  options={
                    clusters?.map((c) => ({
                      value: c.id,
                      label: c.name,
                    })) || []
                  }
                  placeholder="Select Cluster"
                />
              </div>

              {/* View Toggle */}
              <div
                style={{
                  display: 'flex',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  padding: '2px',
                }}
              >
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '6px',
                    borderRadius: '8px',
                    border: 'none',
                    background: viewMode === 'grid' ? 'var(--accent-blue-light)' : 'transparent',
                    color: viewMode === 'grid' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                  }}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  style={{
                    padding: '6px',
                    borderRadius: '8px',
                    border: 'none',
                    background: viewMode === 'table' ? 'var(--accent-blue-light)' : 'transparent',
                    color: viewMode === 'table' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                  }}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          }
        />

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
            <Spinner size="lg" />
            <span style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Fetching nodes info...</span>
          </div>
        ) : sortedNodes.length === 0 ? (
          <Card padding="lg" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <h3>No nodes registered</h3>
            <p>Please ensure your cluster agents are reporting telemetry.</p>
          </Card>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {sortedNodes.map((node) => {
              const isReady = node.status === 'ready';
              return (
                <Card key={node.id} padding="md" hover>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                      {node.name}
                    </span>
                    <Badge variant={isReady ? 'success' : 'danger'}>
                      {isReady ? 'Ready' : 'Not Ready'}
                    </Badge>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <MetricBar label="CPU" value={node.cpuUsage} />
                    <MetricBar label="Memory" value={node.memoryUsage} />
                    <MetricBar label="Disk" value={node.diskUsage} />
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '16px', paddingTop: '12px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    Pods: <strong>{node.podCount} running</strong>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <Card padding="none" hover={false} style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  <th style={{ padding: '12px 20px', cursor: 'pointer' }} onClick={() => handleSort('name')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      NODE NAME <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th style={{ padding: '12px 20px' }}>CLUSTER</th>
                  <th style={{ padding: '12px 20px' }}>STATUS</th>
                  <th style={{ padding: '12px 20px', cursor: 'pointer' }} onClick={() => handleSort('cpuUsage')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      CPU <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th style={{ padding: '12px 20px', cursor: 'pointer' }} onClick={() => handleSort('memoryUsage')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      MEMORY <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th style={{ padding: '12px 20px', cursor: 'pointer' }} onClick={() => handleSort('diskUsage')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      DISK <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th style={{ padding: '12px 20px', cursor: 'pointer' }} onClick={() => handleSort('podCount')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      PODS <ArrowUpDown size={12} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedNodes.map((node, index) => {
                  const isReady = node.status === 'ready';
                  return (
                    <tr
                      key={node.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        fontSize: '13px',
                        backgroundColor: index % 2 === 1 ? '#f8faff' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '14px 20px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {node.name}
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>
                        {activeCluster?.name || 'Cluster'}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <Badge variant={isReady ? 'success' : 'danger'}>
                          {isReady ? 'Ready' : 'Not Ready'}
                        </Badge>
                      </td>
                      <td style={{ padding: '14px 20px', width: '120px' }}>
                        <MetricBar label="" value={node.cpuUsage} showValue />
                      </td>
                      <td style={{ padding: '14px 20px', width: '120px' }}>
                        <MetricBar label="" value={node.memoryUsage} showValue />
                      </td>
                      <td style={{ padding: '14px 20px', width: '120px' }}>
                        <MetricBar label="" value={node.diskUsage} showValue />
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 600 }}>{node.podCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </PageTransition>
  );
};
export default Nodes;
