import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Server,
  Cpu,
  Rocket,
  GitBranch,
  Box,
  Terminal,
  BarChart3,
  History,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useClusterStore } from '../../store/clusterStore';
import { useClusters } from '../../hooks/useClusters';
import { StatusDot } from '../ui/StatusDot';
import { Tooltip } from '../ui/Tooltip';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/clusters', icon: Server, label: 'Clusters' },
  { path: '/nodes', icon: Cpu, label: 'Nodes' },
  { path: '/deployments', icon: Rocket, label: 'Deployments' },
  { path: '/blue-green', icon: GitBranch, label: 'Blue-Green', badge: 'NEW' },
  { path: '/pods', icon: Box, label: 'Pod Explorer' },
  { path: '/logs', icon: Terminal, label: 'Log Viewer' },
  { path: '/metrics', icon: BarChart3, label: 'Metrics' },
  { path: '/releases', icon: History, label: 'Releases' },
];

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  const { activeClusterId } = useClusterStore();
  const { data: clusters } = useClusters();

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(isCollapsed));
    document.documentElement.style.setProperty(
      '--sidebar-width',
      isCollapsed ? '64px' : '240px'
    );
  }, [isCollapsed]);

  const activeCluster = clusters?.find((c) => c.id === activeClusterId);

  const sidebarWidth = isCollapsed ? '64px' : '240px';

  return (
    <aside
      style={{
        width: sidebarWidth,
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width var(--transition-base)',
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      {/* Brand Logo Header */}
      <div
        style={{
          padding: isCollapsed ? '16px 8px' : '24px 20px 16px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isCollapsed ? 'center' : 'flex-start',
          borderBottom: '1px solid var(--border-subtle)',
          minHeight: '80px',
          justifyContent: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontWeight: 800,
              color: 'var(--accent-blue)',
            }}
          >
            ⬡
          </span>
          {!isCollapsed && (
            <span
              className="gradient-text"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              KubeVision
            </span>
          )}
        </div>
        {!isCollapsed && (
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 500 }}>
            Infra. Simplified.
          </span>
        )}
      </div>

      {/* Nav List */}
      <nav
        style={{
          flex: 1,
          padding: '16px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;

          const content = (
            <NavLink
              to={item.path}
              className={({ isActive }: { isActive: boolean }) => (isActive ? 'nav-active' : '')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 500,
                position: 'relative',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                if (!e.currentTarget.classList.contains('nav-active')) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                if (!e.currentTarget.classList.contains('nav-active')) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'none';
                }
              }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!isCollapsed && (
                <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {item.label}
                </span>
              )}
              {!isCollapsed && item.badge && (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'var(--icon-bg-violet)',
                    color: 'white',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );

          if (isCollapsed) {
            return (
              <Tooltip key={item.path} content={item.label}>
                {content}
              </Tooltip>
            );
          }

          return <React.Fragment key={item.path}>{content}</React.Fragment>;
        })}
      </nav>

      {/* Active Cluster Indicator */}
      {!isCollapsed && activeCluster && (
        <div
          style={{
            margin: '0 12px 8px 12px',
            padding: '10px 12px',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <StatusDot status={activeCluster.status.toLowerCase() === 'healthy' ? 'healthy' : 'failed'} size="sm" />
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', lineHeight: 1.2 }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
              ACTIVE CLUSTER
            </span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              {activeCluster.name}
            </span>
          </div>
        </div>
      )}

      {/* Collapse Toggle Button */}
      <div
        style={{
          padding: '12px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: isCollapsed ? 'center' : 'flex-end',
        }}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            border: 'none',
            background: 'var(--bg-elevated)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
