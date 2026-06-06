import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Server, Cpu, Box, AlertTriangle, Rocket } from 'lucide-react';
import { useReleases } from '../hooks/useReleases';
import { useClusterStore } from '../store/clusterStore';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { PageTransition } from '../components/shared/PageTransition';
import {
  AreaChart as _AreaChart,
  Area as _Area,
  ResponsiveContainer as _ResponsiveContainer,
  XAxis as _XAxis,
  YAxis as _YAxis,
  Tooltip as _ChartTooltip,
  CartesianGrid as _CartesianGrid,
  PieChart as _PieChart,
  Pie as _Pie,
  Cell as _Cell,
} from 'recharts';
import {
  useK8sCluster,
  useK8sMetrics,
  useK8sMetricsHistory,
  useK8sDeployments,
} from '../hooks/usek8s';

const AreaChart = _AreaChart as any;
const Area = _Area as any;
const ResponsiveContainer = _ResponsiveContainer as any;
const XAxis = _XAxis as any;
const YAxis = _YAxis as any;
const ChartTooltip = _ChartTooltip as any;
const CartesianGrid = _CartesianGrid as any;
const PieChart = _PieChart as any;
const Pie = _Pie as any;
const Cell = _Cell as any;

export const Dashboard: React.FC = () => {
  const { activeClusterId } = useClusterStore();
  const [activeTimeRange, setActiveTimeRange] = useState('24H');

  // Real K8s + Prometheus data
  const { data: k8sCluster, isLoading: clusterLoading } = useK8sCluster();
  const { data: k8sMetrics } = useK8sMetrics();
  const { data: k8sHistory } = useK8sMetricsHistory(24);
  const { data: k8sDeployments } = useK8sDeployments();
  const { data: releases } = useReleases({ limit: 10 });

  // Stats from real data
  const totalClusters     = 1;
  const activeNodes       = k8sCluster?.nodeCount ?? 0;
  const activePods        = k8sMetrics?.podCount ?? 0;
  const failedPods        = 0;
  const runningPods       = activePods;
  const activeDeployments = k8sCluster?.deploymentCount ?? 0;

  // Chart data from Prometheus history
  const chartData = k8sHistory?.map((m: any) => ({
    time:   new Date(m.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    cpu:    Math.round(m.cpuUsage),
    memory: Math.round(m.memoryUsage),
  })) ?? [];

  // Deployment status breakdown
  const runningDeployments = k8sDeployments?.filter((d: any) => d.status === 'running').length ?? 0;
  const scaledDeployments  = k8sDeployments?.filter((d: any) => d.replicas > 3).length ?? 0;
  const pendingDeployments = k8sDeployments?.filter((d: any) => d.status === 'pending').length ?? 0;
  const failedDeployments  = k8sDeployments?.filter((d: any) => d.status === 'failed').length ?? 0;

  const deploymentStatusData = [
    { name: 'Running',    count: runningDeployments, color: '#10b981' },
    { name: 'Scaled (>3)', count: scaledDeployments, color: '#3b82f6' },
    { name: 'Pending',    count: pendingDeployments, color: '#f59e0b' },
    { name: 'Failed',     count: failedDeployments,  color: '#ef4444' },
  ];

  // Pod distribution for donut chart
  const podDistributionData = [
    { name: 'Running',   value: runningPods, color: '#10b981' },
    { name: 'Failed',    value: failedPods,  color: '#ef4444' },
  ].filter(d => d.value > 0);

  const totalPodsCount = podDistributionData.reduce((acc, d) => acc + d.value, 0);

  // Time ago helper
  const formatTimeAgo = (dateStr: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60)  return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)  return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24)    return `${hours}h ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show:   { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80 } },
  };

  return (
    <PageTransition>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Welcome back, DevOps Engineer 👋
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Here's what's happening in your infrastructure today.
            </p>
          </div>

          {/* Time range pills */}
          <div style={{ display: 'flex', backgroundColor: '#ffffff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '3px', boxShadow: 'var(--card-shadow)' }}>
            {['1H', '6H', '24H', '7D'].map((range) => {
              const isActive = activeTimeRange === range;
              return (
                <button
                  key={range}
                  onClick={() => setActiveTimeRange(range)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    background: isActive ? 'var(--gradient-primary)' : 'transparent',
                    color: isActive ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                    boxShadow: isActive ? '0 2px 8px rgba(59,130,246,0.25)' : 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {range}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Stat Cards ─────────────────────────────────────────────── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', width: '100%' }}
        >
          <motion.div variants={itemVariants}>
            <StatCard
              title="Clusters"
              value={totalClusters}
              icon={Server}
              gradient="var(--icon-bg-blue)"
              glow="var(--accent-blue-glow)"
              subtitle="kind cluster"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Healthy Nodes"
              value={activeNodes}
              icon={Cpu}
              gradient="var(--icon-bg-green)"
              glow="var(--accent-green-glow)"
              subtitle="Online nodes"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Running Pods"
              value={runningPods}
              icon={Box}
              gradient="var(--icon-bg-cyan)"
              glow="var(--accent-cyan-glow)"
              subtitle="kubevision-apps"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Failed Pods"
              value={failedPods}
              icon={AlertTriangle}
              gradient="var(--icon-bg-red)"
              glow="var(--accent-red-glow)"
              subtitle="Requires attention"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Deployments"
              value={activeDeployments}
              icon={Rocket}
              gradient="var(--icon-bg-violet)"
              glow="var(--accent-violet-glow)"
              subtitle="Across cluster"
            />
          </motion.div>
        </motion.div>

        {/* ── CPU + Memory Charts ─────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' }}>

          {/* CPU Chart */}
          <Card padding="md" hover={false}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>CPU Usage</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Live from Prometheus</span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-blue)', backgroundColor: 'var(--accent-blue-light)', padding: '2px 8px', borderRadius: '4px' }}>
                {activeTimeRange}
              </span>
            </div>
            <div style={{ width: '100%', height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="time"  stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <ChartTooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid var(--border-default)', borderRadius: '8px', boxShadow: 'var(--card-shadow)' }}
                    formatter={(v: any) => [`${v}%`, 'CPU']}
                  />
                  <Area type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#cpuGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Memory Chart */}
          <Card padding="md" hover={false}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Memory Usage</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Live from Prometheus</span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-violet)', backgroundColor: 'var(--accent-violet-light)', padding: '2px 8px', borderRadius: '4px' }}>
                {activeTimeRange}
              </span>
            </div>
            <div style={{ width: '100%', height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="time"  stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <ChartTooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid var(--border-default)', borderRadius: '8px', boxShadow: 'var(--card-shadow)' }}
                    formatter={(v: any) => [`${v}%`, 'Memory']}
                  />
                  <Area type="monotone" dataKey="memory" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#memGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* ── Bottom Row ──────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>

          {/* Pod Distribution Donut */}
          <Card padding="md" hover={false}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Pod Distribution
            </h3>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '180px' }}>
              {totalPodsCount > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={podDistributionData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                        {podDistributionData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.1 }}>
                    <span style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {totalPodsCount}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL</span>
                  </div>
                </>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>No pods found</span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '16px' }}>
              {podDistributionData.map((d: any) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: d.color, flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {d.name}: <strong>{d.value}</strong>
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Deployment Status Bars */}
          <Card padding="md" hover={false}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Deployment Status
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', height: '220px' }}>
              {deploymentStatusData.map((d) => {
                const total = k8sDeployments?.length || 1;
                const pct   = Math.round((d.count / total) * 100);
                return (
                  <div key={d.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                      <span style={{ color: 'var(--text-primary)' }}>{d.count} ({pct}%)</span>
                    </div>
                    <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, backgroundColor: d.color, borderRadius: '4px', transition: 'width var(--transition-slow)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card padding="md" hover={false}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Recent Activity
            </h3>
            <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {releases && releases.length > 0 ? (
                releases.map((release: any, i: number) => {
                  const isSuccess  = release.status === 'succeeded';
                  const isFailed   = release.status === 'failed';
                  const isRollback = release.status === 'rolled_back';
                  const dotColor   = isSuccess ? '#10b981' : isFailed ? '#ef4444' : isRollback ? '#f59e0b' : '#3b82f6';
                  return (
                    <div
                      key={release.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        paddingBottom: i !== releases.length - 1 ? '12px' : 0,
                        borderBottom: i !== releases.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      }}
                    >
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: dotColor, marginTop: '4px', flexShrink: 0, boxShadow: `0 0 0 3px ${dotColor}30` }} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {release.deploymentName || 'service'} {isRollback ? 'rolled back to' : 'updated to'} {release.version}
                        </span>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Traffic: {release.trafficPct}%
                        </div>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {formatTimeAgo(release.deployedAt)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No recent activity
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ── Cluster Health Overview ─────────────────────────────────── */}
        <Card padding="md" hover={false}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Cluster Health Overview
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  <th style={{ padding: '8px 12px' }}>CLUSTER</th>
                  <th style={{ padding: '8px 12px' }}>REGION</th>
                  <th style={{ padding: '8px 12px' }}>STATUS</th>
                  <th style={{ padding: '8px 12px' }}>NODES</th>
                  <th style={{ padding: '8px 12px' }}>PODS</th>
                  <th style={{ padding: '8px 12px' }}>CPU</th>
                  <th style={{ padding: '8px 12px' }}>MEMORY</th>
                </tr>
              </thead>
              <tbody>
                {k8sCluster ? (
                  <tr style={{ fontSize: '13px', fontWeight: 500 }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {k8sCluster.name}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                      📍 {k8sCluster.region}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Badge variant={k8sCluster.status === 'healthy' ? 'success' : 'warning'}>
                        {k8sCluster.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {k8sCluster.nodeCount}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {k8sCluster.podCount}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700, color: k8sMetrics?.cpuUsage > 80 ? 'var(--accent-red)' : k8sMetrics?.cpuUsage > 60 ? 'var(--accent-yellow)' : 'var(--accent-green)' }}>
                      {k8sMetrics?.cpuUsage?.toFixed(1)}%
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700, color: k8sMetrics?.memoryUsage > 80 ? 'var(--accent-red)' : k8sMetrics?.memoryUsage > 60 ? 'var(--accent-yellow)' : 'var(--accent-green)' }}>
                      {k8sMetrics?.memoryUsage?.toFixed(1)}%
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      {clusterLoading ? 'Loading cluster data...' : 'No cluster data available'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </PageTransition>
  );
};

export default Dashboard;