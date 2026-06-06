import React, { useState, useEffect } from 'react';
import { useClusters } from '../../hooks/useClusters';
import { useClusterStore } from '../../store/clusterStore';
import { Search, Bell, ChevronDown, Sun } from 'lucide-react';
import { StatusDot } from '../ui/StatusDot';

export const Header: React.FC = () => {
  const { data: clusters } = useClusters();
  const { activeClusterId, setActiveCluster } = useClusterStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTimeRange, setActiveTimeRange] = useState('24H');

  // Initialize activeClusterId to first cluster if not set
  useEffect(() => {
    if (!activeClusterId && clusters && clusters.length > 0) {
      setActiveCluster(clusters[0].id);
    }
  }, [clusters, activeClusterId, setActiveCluster]);

  const activeCluster = clusters?.find((c) => c.id === activeClusterId);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: '64px',
        backgroundColor: 'var(--bg-header)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
      }}
    >
      {/* Center Search Bar */}
      <div style={{ position: 'relative', width: '280px', display: 'flex', alignItems: 'center' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '12px',
            color: 'var(--text-muted)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          placeholder="Search anything..."
          style={{
            width: '100%',
            height: '36px',
            padding: '0 12px 0 36px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            color: 'var(--text-primary)',
            outline: 'none',
            fontFamily: 'var(--font-body)',
          }}
        />
        <span
          style={{
            position: 'absolute',
            right: '10px',
            fontSize: '10px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-elevated)',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid var(--border-default)',
          }}
        >
          ⌘K
        </span>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Time Range Selector */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '2px',
          }}
        >
          {['1H', '6H', '24H', '7D'].map((range) => {
            const isActive = activeTimeRange === range;
            return (
              <button
                key={range}
                onClick={() => setActiveTimeRange(range)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  background: isActive ? 'var(--gradient-primary)' : 'transparent',
                  color: isActive ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {range}
              </button>
            );
          })}
        </div>

        {/* Cluster Selector Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              height: '36px',
              padding: '0 12px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            <StatusDot status={activeCluster?.status.toLowerCase() === 'healthy' ? 'healthy' : 'failed'} size="sm" />
            <span>{activeCluster?.name || 'Select Cluster'}</span>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '6px',
                width: '200px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--card-shadow-hover)',
                zIndex: 100,
                overflow: 'hidden',
              }}
            >
              {clusters?.map((cluster) => (
                <button
                  key={cluster.id}
                  onClick={() => {
                    setActiveCluster(cluster.id);
                    setDropdownOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '10px 14px',
                    border: 'none',
                    background: cluster.id === activeClusterId ? 'var(--accent-blue-light)' : 'transparent',
                    color: cluster.id === activeClusterId ? 'var(--accent-blue)' : 'var(--text-primary)',
                    fontSize: '13px',
                    fontWeight: cluster.id === activeClusterId ? 600 : 500,
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <StatusDot status={cluster.status.toLowerCase() === 'healthy' ? 'healthy' : 'failed'} size="sm" />
                  <span>{cluster.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={18} color="var(--text-secondary)" style={{ transition: 'color var(--transition-fast)' }} />
          <span
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              backgroundColor: 'var(--accent-red)',
              color: 'white',
              fontSize: '8px',
              fontWeight: 700,
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            3
          </span>
        </div>

        {/* Theme Toggle (static UI) */}
        <button
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Sun size={18} />
        </button>

        {/* Divider */}
        <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border-default)' }} />

        {/* User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            PE
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              DevOps Engineer
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Platform Team</span>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
