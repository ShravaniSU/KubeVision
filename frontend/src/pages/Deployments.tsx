import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Sliders, RefreshCw, Plus, Search, Eye } from 'lucide-react';
import { useClusterStore } from '../store/clusterStore';
import { useClusters } from '../hooks/useClusters';
import { useDeployments, useCreateDeployment, useScaleDeployment, useRestartDeployment } from '../hooks/useDeployments';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Slider } from '../components/ui/Slider';
import { Spinner } from '../components/ui/Spinner';
import { useToast } from '../hooks/useToast';
import { PageHeader } from '../components/layout/PageHeader';
import { PageTransition } from '../components/shared/PageTransition';

export const Deployments: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { activeClusterId, setActiveCluster } = useClusterStore();
  const { data: clusters } = useClusters();

  // Selected filters
  const [filterClusterId, setFilterClusterId] = useState(activeClusterId || '');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEnv, setFilterEnv] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [scaleDeployment, setScaleDeployment] = useState<{ id: string; name: string; replicas: number } | null>(null);
  const [scaleReplicas, setScaleReplicas] = useState(1);

  // Form State
  const [formName, setFormName] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formVersion, setFormVersion] = useState('v1.0.0');
  const [formReplicas, setFormReplicas] = useState(3);
  const [formEnv, setFormEnv] = useState('development');
  const [formClusterId, setFormClusterId] = useState('');

  // Queries/Mutations
  const queryClusterId = filterClusterId || activeClusterId || (clusters && clusters[0]?.id) || '';
  const { data: deployments, isLoading } = useDeployments(queryClusterId);

  const createMutation = useCreateDeployment();
  const scaleMutation = useScaleDeployment();
  const restartMutation = useRestartDeployment();

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName || !formImage || !formVersion || !formClusterId) {
      toast.warning('Please fill in all required fields.', 'Missing fields');
      return;
    }

    const versionRegex = /^v\d+\.\d+\.\d+$/;
    if (!versionRegex.test(formVersion)) {
      toast.warning('Version must match semantic pattern e.g., v1.0.0', 'Invalid Version');
      return;
    }

    createMutation.mutate({
      name: formName,
      image: formImage,
      version: formVersion,
      replicas: formReplicas,
      environment: formEnv,
      clusterId: formClusterId,
    }, {
      onSuccess: () => {
        toast.success(`Deployment ${formName} initialized successfully.`, 'Deployment Created');
        setIsCreateOpen(false);
        // Reset form
        setFormName('');
        setFormImage('');
        setFormVersion('v1.0.0');
        setFormReplicas(3);
      },
      onError: (err: any) => {
        toast.error(err.message || 'Unable to deploy service.', 'Deployment Failed');
      }
    });
  };

  const handleScaleSubmit = () => {
    if (scaleDeployment) {
      scaleMutation.mutate({
        id: scaleDeployment.id,
        replicas: scaleReplicas,
      }, {
        onSuccess: () => {
          toast.success(`Scaled to ${scaleReplicas} replicas.`, 'Deployment Scaled');
          setScaleDeployment(null);
        }
      });
    }
  };

  const handleRestart = (id: string, name: string) => {
    restartMutation.mutate(id, {
      onSuccess: () => {
        toast.success(`Restarting pods of deployment ${name}.`, 'Restart In-Progress');
      }
    });
  };

  // Filter deployments locally
  const filteredDeployments = deployments ? deployments.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.image.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
    const matchesEnv = filterEnv === 'all' || d.environment.toLowerCase() === filterEnv.toLowerCase();
    return matchesSearch && matchesStatus && matchesEnv;
  }) : [];

  const activeCluster = clusters?.find((c) => c.id === queryClusterId);

  return (
    <PageTransition>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <PageHeader
          title="Deployments"
          subtitle="Manage cluster service configurations, versions and replica sets"
          actions={
            <Button
              variant="primary"
              onClick={() => {
                setFormClusterId(queryClusterId);
                setIsCreateOpen(true);
              }}
            >
              <Plus size={16} style={{ marginRight: '6px' }} /> New Deployment
            </Button>
          }
        />

        {/* Filter bar */}
        <Card padding="md" hover={false}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Filter by name or image..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '0 12px 0 36px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
            </div>

            {/* Cluster */}
            <div style={{ width: '160px' }}>
              <Select
                value={filterClusterId}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilterClusterId(val);
                  setActiveCluster(val);
                }}
                options={
                  clusters?.map((c) => ({
                    value: c.id,
                    label: c.name,
                  })) || []
                }
                placeholder="Cluster"
              />
            </div>

            {/* Environment */}
            <div style={{ width: '140px' }}>
              <Select
                value={filterEnv}
                onChange={(e) => setFilterEnv(e.target.value)}
                options={[
                  { value: 'all', label: 'All Environments' },
                  { value: 'production', label: 'Production' },
                  { value: 'staging', label: 'Staging' },
                  { value: 'development', label: 'Development' },
                ]}
                placeholder="Environment"
              />
            </div>

            {/* Status */}
            <div style={{ width: '140px' }}>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'running', label: 'Running' },
                  { value: 'restarting', label: 'Restarting' },
                  { value: 'failed', label: 'Failed' },
                ]}
                placeholder="Status"
              />
            </div>
          </div>
        </Card>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
            <Spinner size="lg" />
            <span style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Retrieving deployments...</span>
          </div>
        ) : filteredDeployments.length === 0 ? (
          <Card padding="lg" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <h3>No Deployments Found</h3>
            <p>Try clearing your filters or create a new deployment configuration.</p>
          </Card>
        ) : (
          /* Table */
          <Card padding="none" hover={false} style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  <th style={{ padding: '12px 20px' }}>NAME</th>
                  <th style={{ padding: '12px 20px' }}>DOCKER IMAGE</th>
                  <th style={{ padding: '12px 20px' }}>VERSION</th>
                  <th style={{ padding: '12px 20px' }}>REPLICAS</th>
                  <th style={{ padding: '12px 20px' }}>STATUS</th>
                  <th style={{ padding: '12px 20px' }}>ENVIRONMENT</th>
                  <th style={{ padding: '12px 20px' }}>CLUSTER</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeployments.map((dep) => {
                  const envLabel = dep.environment.toUpperCase();
                  const envVariant = dep.environment.toLowerCase() === 'production' ? 'danger' : dep.environment.toLowerCase() === 'staging' ? 'warning' : 'info';
                  return (
                    <tr key={dep.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '13px' }}>
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-primary)' }}>{dep.name}</td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                        {dep.image}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', padding: '2px 6px', backgroundColor: 'var(--bg-elevated)', borderRadius: '4px', border: '1px solid var(--border-default)', fontWeight: 600 }}>
                          {dep.version}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 600 }}>{dep.replicas}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <Badge variant={dep.status === 'running' ? 'success' : 'warning'} pulse={dep.status === 'running'}>
                          {dep.status}
                        </Badge>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <Badge variant={envVariant}>{envLabel}</Badge>
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>
                        {activeCluster?.name || 'Cluster'}
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/deployments/${dep.id}`)}>
                            <Eye size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setScaleDeployment({ id: dep.id, name: dep.name, replicas: dep.replicas });
                              setScaleReplicas(dep.replicas);
                            }}
                          >
                            <Sliders size={14} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleRestart(dep.id, dep.name)}>
                            <RefreshCw size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}

        {/* Create Deployment Modal */}
        <AnimatePresence>
          {isCreateOpen && (
            <Modal isOpen={true} onClose={() => setIsCreateOpen(false)} title="Create New Deployment">
              <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Input
                  label="Deployment Name"
                  required
                  placeholder="e.g. auth-service"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />

                <Input
                  label="Docker Image Path"
                  required
                  placeholder="e.g. docker.io/library/node"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Input
                    label="Version Tag"
                    required
                    placeholder="e.g. v1.0.0"
                    value={formVersion}
                    onChange={(e) => setFormVersion(e.target.value)}
                  />

                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                      Environment
                    </label>
                    <Select
                      value={formEnv}
                      onChange={(e) => setFormEnv(e.target.value)}
                      options={[
                        { value: 'development', label: 'Development' },
                        { value: 'staging', label: 'Staging' },
                        { value: 'production', label: 'Production' },
                      ]}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    Deploy Target Cluster
                  </label>
                  <Select
                    value={formClusterId}
                    onChange={(e) => setFormClusterId(e.target.value)}
                    options={
                      clusters?.map((c) => ({
                        value: c.id,
                        label: `${c.name} (${c.environment})`,
                      })) || []
                    }
                    placeholder="Select Cluster Target"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    Replicas count: {formReplicas}
                  </label>
                  <Slider min={1} max={15} value={formReplicas} onChange={(val) => setFormReplicas(val)} />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <Button variant="outline" fullWidth type="button" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" fullWidth type="submit" loading={createMutation.isPending}>
                    Initialize Deployment
                  </Button>
                </div>
              </form>
            </Modal>
          )}
        </AnimatePresence>

        {/* Scale Modal */}
        <AnimatePresence>
          {scaleDeployment && (
            <Modal isOpen={true} onClose={() => setScaleDeployment(null)} title={`Scale Deployment — ${scaleDeployment.name}`}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Current Replicas</div>
                  <div style={{ fontSize: '48px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {scaleDeployment.replicas}
                  </div>
                </div>

                <div style={{ width: '100%' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    Scale to: {scaleReplicas} replicas
                  </label>
                  <Slider min={1} max={20} value={scaleReplicas} onChange={(val) => setScaleReplicas(val)} />
                </div>

                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-blue)' }}>
                  {scaleDeployment.replicas} → {scaleReplicas} replicas
                </div>

                <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                  <Button variant="outline" fullWidth onClick={() => setScaleDeployment(null)}>
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
export default Deployments;
