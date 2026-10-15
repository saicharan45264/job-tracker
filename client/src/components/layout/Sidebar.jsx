import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  BriefcaseBusiness,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export const Sidebar = ({ isCollapsed, toggleCollapse, mobileOpen, closeMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      toast.error('Failed to log out');
    }
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/applications', label: 'My Applications', icon: Briefcase },
    { to: '/interviews', label: 'Interview Calendar', icon: Calendar },
    { to: '/companies', label: 'Companies', icon: Building2 },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 1019 }}
          onClick={closeMobile}
        />
      )}

      <aside
        className={`app-sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''
          }`}
      >
        {/* Header / Brand */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <BriefcaseBusiness size={20} strokeWidth={2.2} />
            </div>
            {!isCollapsed && (
              <div>
                <span className="fw-bold tracking-tight">CareerTrack</span>
                <span className="d-block text-muted" style={{ fontSize: '0.65rem', fontWeight: 500 }}>
                  Job Tracker Pro
                </span>
              </div>
            )}
          </div>
          <button
            onClick={toggleCollapse}
            className="btn btn-sm text-secondary p-0 d-none d-lg-flex align-items-center justify-content-center"
            style={{ width: 28, height: 28 }}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-menu">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
                title={isCollapsed ? link.label : undefined}
              >
                <Icon size={19} className="flex-shrink-0" />
                {!isCollapsed && <span>{link.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / User Profile */}
        <div className="sidebar-footer">
          <div
            className={`d-flex align-items-center gap-2 p-2 rounded-3 ${isCollapsed ? 'justify-content-center' : ''
              }`}
            style={{ background: 'var(--surface-alt)' }}
          >
            <div
              className="d-flex align-items-center justify-content-center text-white fw-bold rounded-circle flex-shrink-0"
              style={{
                width: 34,
                height: 34,
                background: 'linear-gradient(135deg, #800020, #A51D38)',
                boxShadow: '0 2px 8px rgba(128, 0, 32, 0.35)',
                fontSize: '0.85rem',
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden flex-1" style={{ minWidth: 0 }}>
                <p className="fw-semibold text-main mb-0 small text-truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-muted mb-0 text-truncate" style={{ fontSize: '0.72rem' }}>
                  {user?.email || ''}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={`btn btn-sm d-flex align-items-center gap-2 text-danger w-100 ${isCollapsed ? 'justify-content-center' : 'justify-content-start'
              } px-2 py-2 mt-1 rounded-2`}
            title={isCollapsed ? 'Logout' : undefined}
            style={{ transition: 'background 0.2s' }}
          >
            <LogOut size={16} />
            {!isCollapsed && <span className="small fw-semibold">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
