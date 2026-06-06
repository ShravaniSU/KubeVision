import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, Box, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { useClusterStore } from '../store/clusterStore';
import { useClusters } from '../hooks/useClusters';
import { useNodes } from '../hooks/useNodes';
import { useMetricsLatest, useMetricsHistory } from '../hooks/useMetrics';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { MetricBar } from '../components/ui/MetricBar';
import { Spinner } from '../components/ui/Spinner';
import { PageHeader } from '../components/layout/PageHeader';
import { PageTransition } from '../components/shared/PageTransition';
import {
  AreaChart as _AreaChart,
  Area as _Area,
  LineChart as _LineChart,
  Line as _Line,
  BarChart as _BarChart,
  Bar as _Bar,
  XAxis as _XAxis,
  YAxis as _YAxis,
  CartesianGrid as _CartesianGrid,
  Tooltip as _ChartTooltip,
  ResponsiveContainer as _ResponsiveContainer,
  Cell as _Cell,
} from 'recharts';

const AreaChart = _AreaChart as any;
const Area = _Area as any;
const LineChart = _LineChart as any;
const Line = _Line as any;
const BarChart = _BarChart as any;
const Bar = _Bar as any;
const XAxis = _XAxis as any;
const YAxis = _YAxis as any;
const CartesianGrid = _CartesianGrid as any;
const ChartTooltip = _ChartTooltip as any;
const ResponsiveContainer = _ResponsiveContainer as any;
const Cell = _Cell as any;

type SortField = 'name' | 'cpuUsage' | 'memoryUsage' | 'diskUsage' | 'status';
type SortOrder = 'asc' | 'desc';

export const Metrics: React.FC = () => {
  const { activeClusterId, setActiveCluster } = useClusterStore();
  const { data: clusters } = useClusters();
  const { data: nodes, isLoading: nodesLoading } = useNodes(activeClusterId || '');
  const { data: latestMetrics } = useMetricsLatest(activeClusterId || '');
  const { data: historyMetrics } = useMetricsHistory(activeClusterId || '', 24);

  const [timeRange, setTimeRange] = useState('24H');
  const [countdown, setCountdown] = useState(30);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // countdown for auto-refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 30; // reset
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const chartData = historyMetrics?.map((m) => ({
    time: new Date(m.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    cpu: Math.round(m.cpuUsage),
    memory: Math.round(m.memoryUsage),
    pods: m.podCount,
    failed: m.failedPods,
  })) || Array.from({ length: 12 }, (_, i) => ({
    time: `${i * 2}:00`,
    cpu: Math.floor(Math.random() * 30) + 30,
    memory: Math.floor(Math.random() * 20) + 40,
    pods: 10 + i,
    failed: i === 5 ? 1 : 0,
  }));

  const activeCluster = clusters?.find((c) => c.id === activeClusterId);

  // Aggregated values
  const avgCpu = Math.round(latestMetrics?.cpuUsage || 0);
  const avgMemory = Math.round(latestMetrics?.memoryUsage || 0);
  const totalPods = latestMetrics?.podCount || 0;
  const failedPods = latestMetrics?.failedPods || 0;

  return (
    <PageTransition>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        {/* Header row */}
        <PageHeader
          title="Telemetry Dashboard"
          subtitle="Aggregated node cluster statistics and historic charts"
          actions={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  padding: '6px 12px',
                  borderRadius: '16px',
                }}
              >
                🔄 Refreshing in {countdown}s...
              </span>

              {/* Cluster Filter */}
              <div style={{ width: '160px' }}>
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

              {/* Time Pills */}
              <div
                style={{
                  display: 'flex',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  padding: '2px',
                }}
              >
                {['1H', '6H', '24H', '7D'].map((range) => {
                  const isActive = timeRange === range;
                  return (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: isActive ? 'var(--gradient-primary)' : 'transparent',
                        color: isActive ? '#ffffff' : 'var(--text-secondary)',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      {range}
                    </button>
                  );
                })}
              </div>
            </div>
          }
        />

        {/* 4 Mini Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <StatCard title="Avg CPU usage" value={`${avgCpu}%`} icon={Cpu} gradient="var(--icon-bg-blue)" glow="var(--accent-blue-glow)" />
          <StatCard title="Avg Memory usage" value={`${avgMemory}%`} icon={Activity} gradient="var(--icon-bg-violet)" glow="var(--accent-violet-glow)" />
          <StatCard title="Total Pods" value={totalPods} icon={Box} gradient="var(--icon-bg-cyan)" glow="var(--accent-cyan-glow)" />
          <StatCard title="Failed Pods" value={failedPods} icon={AlertTriangle} gradient="var(--icon-bg-red)" glow="var(--accent-red-glow)" />
        </div>

        {/* 2x2 synchronized Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' }}>
          {/* Chart 1: CPU */}
          <Card padding="md" hover={false}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
              CPU Utilization (%)
            </h3>
            <div style={{ width: '100%', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart syncId="metrics" data={chartData} margin={{ left: -20, right: 10, top: 5, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <ChartTooltip />
                  <Area type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} fillOpacity={0.15} fill="#3b82f6" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 2: Memory */}
          <Card padding="md" hover={false}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Memory Utilization (%)
            </h3>
            <div style={{ width: '100%', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart syncId="metrics" data={chartData} margin={{ left: -20, right: 10, top: 5, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <ChartTooltip />
                  <Area type="monotone" dataKey="memory" stroke="#8b5cf6" strokeWidth={2} fillOpacity={0.15} fill="#8b5cf6" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 3: Pod Count */}
          <Card padding="md" hover={false}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Total Pod Count
            </h3>
            <div style={{ width: '100%', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ left: -20, right: 10, top: 5, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <ChartTooltip />
                  <Line type="monotone" dataKey="pods" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 4: Failed Pods */}
          <Card padding="md" hover={false}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Failed Pod count
            </h3>
            <div style={{ width: '100%', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ left: -20, right: 10, top: 5, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <ChartTooltip />
                  <Bar dataKey="failed" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.failed > 0 ? '#ef4444' : '#cbd5e1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Per-Node Breakdown Table */}
        <Card padding="none" hover={false} style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-default)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Per-Node Resource Breakdown</h3>
          </div>
          {nodesLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}><Spinner size="md" /></div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  <th style={{ padding: '12px 20px', cursor: 'pointer' }} onClick={() => handleSort('name')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      NODE <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th style={{ padding: '12px 20px' }}>CLUSTER</th>
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
                  <th style={{ padding: '12px 20px', cursor: 'pointer' }} onClick={() => handleSort('status')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      STATUS <ArrowUpDown size={12} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedNodes.map((node, index) => (
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
                    <td style={{ padding: '14px 20px', width: '150px' }}>
                      <MetricBar label="" value={node.cpuUsage} showValue />
                    </td>
                    <td style={{ padding: '14px 20px', width: '150px' }}>
                      <MetricBar label="" value={node.memoryUsage} showValue />
                    </td>
                    <td style={{ padding: '14px 20px', width: '150px' }}>
                      <MetricBar label="" value={node.diskUsage} showValue />
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <Badge variant={node.status === 'ready' ? 'success' : 'danger'}>
                        {node.status.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </PageTransition>
  );
};
export default Metrics;
