import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { StatusBar } from './StatusBar';
import { ToastContainer } from '../ui/Toast';

export const Layout: React.FC = () => {
  const location = useLocation();

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-base)',
      }}
    >
      <Sidebar />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          marginLeft: 'var(--sidebar-width)',
          transition: 'margin-left var(--transition-base)',
          minHeight: '100vh',
        }}
      >
        <Header />
        <main
          style={{
            flex: 1,
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <AnimatePresence mode="wait">
            <Outlet key={location.pathname} />
          </AnimatePresence>
        </main>
        <StatusBar />
      </div>
      <ToastContainer />
    </div>
  );
};
export default Layout;
