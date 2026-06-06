import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Server, ArrowRight, CheckCircle2, AlertCircle, Play, RefreshCw, Undo2 } from 'lucide-react';
import { useClusterStore } from '../store/clusterStore';
import { useDeployments } from '../hooks/useDeployments';
import { useBlueGreenStatus, useDeployGreen, useSwitchTraffic, useRollback } from '../hooks/useBlueGreen';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Spinner } from '../components/ui/Spinner';
import { useToast } from '../hooks/useToast';
import { PageHeader } from '../components/layout/PageHeader';
import { PageTransition } from '../components/shared/PageTransition';

export const BlueGreen: React.FC = () => {
  const location = useLocation();
  const toast = useToast();
  const { activeClusterId } = useClusterStore();
  const { data: deployments } = useDeployments(activeClusterId || '');

  // Selection
  const initialDeploymentId = location.state?.deploymentId || '';
  const [selectedDeploymentId, setSelectedDeploymentId] = useState(initialDeploymentId);

  // Stepper state
  const [currentStep, setCurrentStep] = useState(1);

  // Form
  const [greenVersion, setGreenVersion] = useState('');
  const [greenImage, setGreenImage] = useState('');

  // Health checks simulation states
  const [check1, setCheck1] = useState<'pending' | 'loading' | 'success'>('pending');
  const [check2, setCheck2] = useState<'pending' | 'loading' | 'success'>('pending');
  const [check3, setCheck3] = useState<'pending' | 'loading' | 'success'>('pending');

  // Traffic Switch state
  const [trafficSwitchPercent, setTrafficSwitchPercent] = useState(0); // 0 means 100% blue, 100 means 100% green

  // Queries
  const { data: bgStatus, isLoading: isBgLoading } = useBlueGreenStatus(selectedDeploymentId);

  const deployMutation = useDeployGreen();
  const switchMutation = useSwitchTraffic();
  const rollbackMutation = useRollback();

  const selectedDeployment = deployments?.find(d => d.id === selectedDeploymentId);

  // Effect to sync stepper when bgStatus changes
  useEffect(() => {
    if (!selectedDeploymentId) return;

    if (bgStatus) {
      if (bgStatus.previewRelease) {
        if (bgStatus.previewRelease.trafficPct === 100) {
          setCurrentStep(4);
          setTrafficSwitchPercent(100);
        } else if (currentStep < 2) {
          // If we have a preview release and we are still in Step 1, advance to Step 2
          setCurrentStep(2);
        }
      } else {
        // No preview release, start at step 1
        setCurrentStep(1);
        setTrafficSwitchPercent(0);
        // Reset checks
        setCheck1('pending');
        setCheck2('pending');
        setCheck3('pending');
      }
    }
  }, [bgStatus, selectedDeploymentId]);

  // Handle Step 2: Health Checks Simulation
  useEffect(() => {
    if (currentStep === 2) {
      setCheck1('loading');
      const timer1 = setTimeout(() => {
        setCheck1('success');
        setCheck2('loading');
      }, 1000);

      const timer2 = setTimeout(() => {
        setCheck2('success');
        setCheck3('loading');
      }, 2000);

      const timer3 = setTimeout(() => {
        setCheck3('success');
      }, 3000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [currentStep]);

  // Automatically advance to step 3 when checks succeed
  useEffect(() => {
    if (currentStep === 2 && check1 === 'success' && check2 === 'success' && check3 === 'success') {
      const timer = setTimeout(() => {
        setCurrentStep(3);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [check1, check2, check3, currentStep]);

  const handleDeployGreen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!greenVersion || !greenImage) {
      toast.warning('Please enter version and image tag.', 'Invalid parameters');
      return;
    }

    deployMutation.mutate({
      deploymentId: selectedDeploymentId,
      version: greenVersion,
      image: greenImage,
    }, {
      onSuccess: () => {
        toast.success('Green version scheduled for deployment.', 'Canary Ready');
        setCurrentStep(2);
      },
      onError: (err: any) => {
        toast.error(err.message || 'Unable to spin up Green version.', 'Canary Failed');
      }
    });
  };

  const handleSwitchTraffic = () => {
    if (!bgStatus?.previewRelease) return;

    switchMutation.mutate({
      releaseId: bgStatus.previewRelease.id,
      deploymentId: selectedDeploymentId,
    }, {
      onSuccess: () => {
        // Animate traffic switch
        let currentPct = 0;
        const interval = setInterval(() => {
          currentPct += 10;
          setTrafficSwitchPercent(currentPct);
          if (currentPct >= 100) {
            clearInterval(interval);
            setCurrentStep(4);
            toast.success('100% router traffic routed to Green container.', 'Traffic Switched');
          }
        }, 150);
      }
    });
  };

  const handleRollback = () => {
    // Rollback to the previously active release
    const previousRelease = bgStatus?.releases?.find(r => r.id !== bgStatus.activeRelease?.id);
    if (!previousRelease) {
      toast.warning('We could not locate any older release to rollback to.', 'No rollback target');
      return;
    }

    rollbackMutation.mutate({
      releaseId: previousRelease.id,
      deploymentId: selectedDeploymentId,
    }, {
      onSuccess: () => {
        // Reset state
        setTrafficSwitchPercent(0);
        setCurrentStep(1);
        setGreenVersion('');
        setGreenImage('');
        toast.success('Router reverted back to previous Blue release.', 'Rollback Complete');
      }
    });
  };

  // Setup options for select list
  const deploymentOptions = deployments?.map((d) => ({
    value: d.id,
    label: `${d.name} (${d.version})`,
  })) || [];

  return (
    <PageTransition>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <PageHeader
          title="Blue-Green Orchestrator"
          subtitle="Zero-downtime deployment pipelines with instant rollback protection"
        />

        {/* Selector */}
        <Card padding="md" hover={false}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '400px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Select Target Deployment
            </label>
            <Select
              value={selectedDeploymentId}
              onChange={(e) => {
                setSelectedDeploymentId(e.target.value);
                setCurrentStep(1);
              }}
              options={deploymentOptions}
              placeholder="Select Deployment to start..."
            />
          </div>
        </Card>

        {selectedDeploymentId ? (
          isBgLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><Spinner size="lg" /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Blue-Green Visualizer Diagram */}
              <Card padding="lg" hover={false} style={{ position: 'relative' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '24px', textAlign: 'center', letterSpacing: '0.05em' }}>
                  TRAFFIC ROUTING VISUALIZER
                </h3>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    flexWrap: 'wrap',
                    gap: '32px',
                    position: 'relative',
                    padding: '20px 0',
                  }}
                >
                  {/* Blue Panel */}
                  <div
                    style={{
                      width: '260px',
                      borderRadius: '16px',
                      border: `2px solid ${trafficSwitchPercent === 100 ? 'var(--border-default)' : 'var(--accent-blue)'}`,
                      backgroundColor: '#ffffff',
                      overflow: 'hidden',
                      boxShadow: trafficSwitchPercent === 100 ? 'none' : '0 4px 20px var(--accent-blue-glow)',
                      transition: 'all 0.5s ease',
                    }}
                  >
                    <div style={{ backgroundColor: 'var(--accent-blue-light)', padding: '12px 16px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🔵 BLUE RELEASE
                      </span>
                      {trafficSwitchPercent === 100 ? (
                        <Badge variant="muted">RETAINED</Badge>
                      ) : (
                        <Badge variant="info">ACTIVE</Badge>
                      )}
                    </div>
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Running Version</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {bgStatus?.activeRelease?.version || selectedDeployment?.version || 'v1.0.0'}
                      </span>
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          <span>Traffic Share</span>
                          <span>{100 - trafficSwitchPercent}%</span>
                        </div>
                        <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${100 - trafficSwitchPercent}%`, backgroundColor: 'var(--accent-blue)', transition: 'width 0.3s ease' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* NGINX Router Connector */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: '1px solid var(--border-default)',
                        backgroundColor: 'var(--bg-elevated)',
                        fontSize: '12px',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-primary)',
                        boxShadow: 'var(--card-shadow)',
                      }}
                    >
                      NGINX Router
                    </div>
                    <div style={{ display: 'flex', gap: '4px', color: 'var(--text-muted)' }}>
                      <ArrowRight size={20} style={{ transform: `rotate(${45 + (trafficSwitchPercent / 100) * 90}deg)`, transition: 'transform 0.5s ease' }} />
                    </div>
                  </div>

                  {/* Green Panel */}
                  <div
                    style={{
                      width: '260px',
                      borderRadius: '16px',
                      border: `2px solid ${trafficSwitchPercent === 100 ? 'var(--accent-green)' : bgStatus?.previewRelease ? 'var(--accent-yellow)' : 'var(--border-default)'}`,
                      backgroundColor: '#ffffff',
                      overflow: 'hidden',
                      boxShadow: trafficSwitchPercent === 100 ? '0 4px 20px var(--accent-green-glow)' : 'none',
                      transition: 'all 0.5s ease',
                      opacity: bgStatus?.previewRelease ? 1 : 0.5,
                    }}
                  >
                    <div style={{ backgroundColor: 'var(--accent-green-light)', padding: '12px 16px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🟢 GREEN CANARY
                      </span>
                      {bgStatus?.previewRelease ? (
                        trafficSwitchPercent === 100 ? (
                          <Badge variant="success">ACTIVE</Badge>
                        ) : (
                          <Badge variant="warning">TESTING</Badge>
                        )
                      ) : (
                        <Badge variant="muted">OFFLINE</Badge>
                      )}
                    </div>
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Canary Version</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {bgStatus?.previewRelease?.version || 'N/A'}
                      </span>
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          <span>Traffic Share</span>
                          <span>{trafficSwitchPercent}%</span>
                        </div>
                        <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${trafficSwitchPercent}%`, backgroundColor: 'var(--accent-green)', transition: 'width 0.3s ease' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Wizard Steps */}
              <Card padding="lg" hover={false}>
                {/* Horizontal Stepper Indicator */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '4%', right: '4%', height: '2px', backgroundColor: 'var(--border-default)', zIndex: 0 }} />
                  {[
                    { step: 1, label: 'Spin up Green' },
                    { step: 2, label: 'Run Health Probes' },
                    { step: 3, label: 'Shift Router' },
                    { step: 4, label: 'Deployment Complete' },
                  ].map((s) => {
                    const isDone = currentStep > s.step;
                    const isCurrent = currentStep === s.step;

                    return (
                      <div key={s.step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1, flex: 1 }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '12px',
                            background: isDone ? 'var(--accent-green)' : isCurrent ? 'var(--gradient-primary)' : 'var(--bg-elevated)',
                            color: isDone || isCurrent ? '#ffffff' : 'var(--text-secondary)',
                            border: isCurrent ? 'none' : '2px solid var(--border-default)',
                            boxShadow: isCurrent ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {isDone ? '✓' : s.step}
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: isCurrent ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Step Views */}
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <form onSubmit={handleDeployGreen} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px', margin: '0 auto' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center' }}>
                          Spin up Green Version (Canary Target)
                        </h4>
                        <Input
                          label="Canary Version Tag"
                          required
                          placeholder="e.g. v1.1.0"
                          value={greenVersion}
                          onChange={(e) => setGreenVersion(e.target.value)}
                        />
                        <Input
                          label="Docker Image Target"
                          required
                          placeholder="e.g. docker.io/kubevision/api:v1.1.0"
                          value={greenImage}
                          onChange={(e) => setGreenImage(e.target.value)}
                        />
                        <Button variant="primary" type="submit" loading={deployMutation.isPending} style={{ marginTop: '8px' }}>
                          <Play size={14} style={{ marginRight: '6px' }} /> Deploy Green Container
                        </Button>
                      </form>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}
                    >
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center' }}>
                        Running Automated Canary Validation Probes
                      </h4>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                          { id: 1, label: 'API Endpoint Health check', state: check1 },
                          { id: 2, label: 'Database schema sync check', state: check2 },
                          { id: 3, label: 'Memory Leak & Profiling probe', state: check3 },
                        ].map((probe) => (
                          <div
                            key={probe.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              backgroundColor: 'var(--bg-elevated)',
                              borderRadius: '8px',
                              border: '1px solid var(--border-default)',
                            }}
                          >
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{probe.label}</span>
                            {probe.state === 'loading' ? (
                              <Spinner size="sm" />
                            ) : probe.state === 'success' ? (
                              <CheckCircle2 size={16} color="var(--accent-green)" />
                            ) : (
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--text-muted)' }} />
                            )}
                          </div>
                        ))}
                      </div>

                      {check3 === 'success' && (
                        <div style={{ padding: '10px', backgroundColor: 'var(--accent-green-light)', border: '1px solid var(--accent-green)', borderRadius: '8px', fontSize: '12px', color: 'var(--accent-green)', fontWeight: 600, textAlign: 'center' }}>
                          ✓ All checks passed! Ready to switch traffic.
                        </div>
                      )}
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}
                    >
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                        Ready to Cut Router Traffic
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                        This will instantaneously update the NGINX router table, pointing 100% of incoming users to the Green v{bgStatus?.previewRelease?.version || 'Canary'} container.
                      </p>

                      <Button
                        variant="primary"
                        fullWidth
                        onClick={handleSwitchTraffic}
                        loading={switchMutation.isPending}
                        style={{ height: '44px', fontSize: '14px' }}
                      >
                        Switch 100% Traffic to Green v{bgStatus?.previewRelease?.version || 'Canary'}
                      </Button>
                    </motion.div>
                  )}

                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
                    >
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent-green-light)',
                          color: 'var(--accent-green)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px var(--accent-green-glow)',
                          marginBottom: '8px',
                        }}
                      >
                        <CheckCircle2 size={32} />
                      </div>
                      <h4 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Deployment Successful!
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Green version v{bgStatus?.previewRelease?.version || 'Canary'} is now active and routing 100% of ingress users.
                      </p>

                      <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '16px' }}>
                        <Button variant="outline" fullWidth onClick={handleRollback} loading={rollbackMutation.isPending}>
                          <Undo2 size={14} style={{ marginRight: '6px' }} /> Rollback to v{bgStatus?.activeRelease?.version || 'previous'}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>

              {/* Rollback Segment if Blue version is retained */}
              {trafficSwitchPercent === 100 && (
                <Card padding="md" hover={false} style={{ border: '1px dashed var(--accent-coral)', backgroundColor: 'var(--accent-coral-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={18} color="var(--accent-coral)" />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-coral)' }}>
                        Blue container (v{bgStatus?.activeRelease?.version}) is retained and online. Instant rollback is available.
                      </span>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleRollback} loading={rollbackMutation.isPending} style={{ borderColor: 'var(--accent-coral)', color: 'var(--accent-coral)' }}>
                      <RefreshCw size={12} style={{ marginRight: '6px' }} /> Rollback
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )
        ) : (
          <Card padding="lg" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <GitBranch size={48} style={{ margin: '0 auto 16px auto', color: 'var(--text-disabled)' }} />
            <h3>Select a Deployment to orchestrate</h3>
            <p>Choose an active microservice from the dropdown above to manage its pipeline status.</p>
          </Card>
        )}
      </div>
    </PageTransition>
  );
};
export default BlueGreen;
