import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cpu, Box, Rocket } from 'lucide-react';
import { useClusters } from '../hooks/useClusters';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatusDot } from '../components/ui/StatusDot';
import { Spinner } from '../components/ui/Spinner';
import { PageTransition } from '../components/shared/PageTransition';

export const Clusters: React.FC = () => {
  const navigate = useNavigate();
  const { data: clusters, isLoading, error } = useClusters();

  if (isLoading) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <Spinner size="lg" />
        <span style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>Loading clusters...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card padding="lg" style={{ textAlign: 'center', color: 'var(--accent-red)' }}>
        <h3>Error loading clusters</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Please check your network and try again.</p>
      </Card>
    );
  }

  const getEnvAccent = (env: string) => {
    switch (env.toLowerCase()) {
      case 'production':
        return 'linear-gradient(90deg, #f97316, #ef4444)';
      case 'staging':
        return 'linear-gradient(90deg, #8b5cf6, #ec4899)';
      default:
        return 'linear-gradient(90deg, #06b6d4, #3b82f6)';
    }
  };

  const getEnvBadge = (env: string) => {
    switch (env.toLowerCase()) {
      case 'production':
        return <Badge variant="danger">PROD</Badge>;
      case 'staging':
        return <Badge variant="warning">STG</Badge>; // Or customize variants
      default:
        return <Badge variant="info">DEV</Badge>;
    }
  };

  const getBorderHoverColor = (env: string) => {
    switch (env.toLowerCase()) {
      case 'production':
        return '#ef4444';
      case 'staging':
        return '#8b5cf6';
      default:
        return '#3b82f6';
    }
  };

  return (
    <PageTransition>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            Infrastructure Clusters
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Overview and status monitoring for all connected clusters.
          </p>
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
            width: '100%',
          }}
        >
          {clusters?.map((cluster) => {
            const envColor = getBorderHoverColor(cluster.environment);
            const isHealthy = cluster.status.toLowerCase() === 'healthy';
            return (
              <motion.div
                key={cluster.id}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: { opacity: 1, y: 0 },
                }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                onClick={() => navigate(`/clusters/${cluster.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <Card
                  padding="none"
                  hover={true}
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'border-color var(--transition-base)',
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.borderColor = envColor)}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.borderColor = 'var(--card-border)')}
                >
                  {/* Top Gradient Strip */}
                  <div
                    style={{
                      height: '4px',
                      width: '100%',
                      background: getEnvAccent(cluster.environment),
                    }}
                  />

                  {/* Body Content */}
                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {getEnvBadge(cluster.environment)}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <StatusDot status={isHealthy ? 'healthy' : 'warning'} size="sm" />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {cluster.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div style={{ margin: '8px 0' }}>
                      <h2
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '20px',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {cluster.name}
                      </h2>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        📍 {cluster.region}
                      </span>
                    </div>

                    {/* Divider */}
                    <div style={{ height: '1px', backgroundColor: 'var(--border-default)' }} />

                    {/* Stat Chips */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 10px',
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--border-default)',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <Cpu size={14} color="var(--accent-blue)" />
                        <span>Nodes: <strong>{cluster.nodeCount}</strong></span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 10px',
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--border-default)',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <Box size={14} color="var(--accent-green)" />
                        <span>Pods: <strong>{cluster.podCount}</strong></span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 10px',
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--border-default)',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <Rocket size={14} color="var(--accent-violet)" />
                        <span>Deployments: <strong>{cluster.deploymentCount}</strong></span>
                      </div>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                      <Button variant="outline" fullWidth style={{ borderColor: 'var(--border-default)' }}>
                        View Cluster Details →
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </PageTransition>
  );
};
export default Clusters;
