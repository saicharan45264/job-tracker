import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar.jsx';
import { Navbar } from './Navbar.jsx';
import { ApplicationFormModal } from '../applications/ApplicationFormModal.jsx';
import { applicationsApi } from '../../api/applications.api.js';
import toast, { Toaster } from 'react-hot-toast';

export const AppShell = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const location = useLocation();

  const handleCreateApplication = async (formData) => {
    try {
      setModalLoading(true);
      await applicationsApi.createApplication(formData);
      toast.success('Job application created successfully!');
      setIsAddModalOpen(false);
      // Trigger a custom event so child page components (Applications, Dashboard) can re-fetch
      window.dispatchEvent(new CustomEvent('careertrack:refresh-data'));
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create application';
      toast.error(msg);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '10px',
            background: '#1E2130',
            color: '#fff',
            fontSize: '0.875rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          },
        }}
      />

      <Sidebar
        isCollapsed={isCollapsed}
        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
        mobileOpen={mobileOpen}
        closeMobile={() => setMobileOpen(false)}
      />

      <div className="main-wrapper">
        <Navbar
          toggleMobile={() => setMobileOpen(!mobileOpen)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />

        <main className="content-body">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Quick Add Application Modal */}
      <ApplicationFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateApplication}
        loading={modalLoading}
      />
    </div>
  );
};
