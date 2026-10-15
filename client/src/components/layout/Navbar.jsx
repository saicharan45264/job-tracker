import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Plus,
  User,
  Settings,
  LogOut,
  CheckCircle2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import toast from 'react-hot-toast';

export const Navbar = ({ toggleMobile, onOpenAddModal }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/applications?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard Overview';
    if (path.startsWith('/applications/')) return 'Application Details';
    if (path.startsWith('/applications')) return 'Applications Tracker';
    if (path.startsWith('/interviews')) return 'Interview Schedule & Calendar';
    if (path.startsWith('/companies')) return 'Companies Directory';
    if (path.startsWith('/analytics')) return 'Search & Pipeline Analytics';
    if (path.startsWith('/settings')) return 'Account & Preferences';
    return 'CareerTrack';
  };

  return (
    <header className="app-navbar">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="d-flex align-items-center gap-3">
        <button
          onClick={toggleMobile}
          className="btn btn-sm d-lg-none p-1 text-secondary"
          aria-label="Toggle Navigation"
        >
          <Menu size={22} />
        </button>
        <div>
          <h1 className="h5 mb-0 fw-bold text-main" style={{ letterSpacing: '-0.02em' }}>
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Middle: Global Search */}
      <form onSubmit={handleSearchSubmit} className="navbar-search d-none d-md-block">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search applications, companies, tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      {/* Right: Actions */}
      <div className="d-flex align-items-center gap-2">
        {/* Quick Add Application Button */}
        <button
          onClick={onOpenAddModal}
          className="btn btn-primary-ct btn-sm d-none d-sm-inline-flex"
        >
          <Plus size={16} />
          <span>Add Application</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="position-relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn btn-sm text-secondary position-relative p-2 rounded-circle"
            style={{ background: showNotifications ? 'var(--primary-subtle)' : 'transparent' }}
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span
                className="position-absolute top-1 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: '0.65rem', padding: '0.25em 0.45em' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="position-absolute end-0 mt-2 bg-white border rounded-3 shadow-lg p-0"
              style={{ width: 340, zIndex: 1050, borderColor: 'var(--border-color)' }}
            >
              <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
                <span className="fw-bold text-main small">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="btn btn-link btn-sm text-primary p-0 text-decoration-none small"
                    style={{ fontSize: '0.75rem' }}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted small">No notifications yet</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`p-3 border-bottom d-flex align-items-start gap-2 ${!n.isRead ? 'bg-light' : ''
                        }`}
                      style={{ transition: 'background 0.2s' }}
                    >
                      <div className="flex-1" style={{ minWidth: 0 }}>
                        <p className="fw-semibold small text-main mb-1">{n.title}</p>
                        <p className="text-secondary small mb-1" style={{ fontSize: '0.8rem' }}>
                          {n.message}
                        </p>
                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="d-flex flex-column gap-1">
                        {!n.isRead && (
                          <button
                            onClick={() => markAsRead(n._id)}
                            className="btn btn-sm btn-link text-primary p-0"
                            title="Mark as read"
                          >
                            <CheckCircle2 size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(n._id)}
                          className="btn btn-sm btn-link text-muted p-0"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Dropdown */}
        <div className="position-relative ms-1" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="btn btn-sm p-0 rounded-circle border-0"
          >
            <div
              className="d-flex align-items-center justify-content-center text-white fw-bold rounded-circle shadow-sm"
              style={{
                width: 38,
                height: 38,
                background: 'linear-gradient(135deg, #800020, #A51D38)',
                boxShadow: '0 2px 8px rgba(128, 0, 32, 0.35)',
                fontSize: '0.9rem',
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </button>

          {showProfileMenu && (
            <div
              className="position-absolute end-0 mt-2 bg-white border rounded-3 shadow-lg py-2"
              style={{ width: 200, zIndex: 1050, borderColor: 'var(--border-color)' }}
            >
              <div className="px-3 py-2 border-bottom">
                <p className="fw-bold text-main mb-0 small text-truncate">{user?.name}</p>
                <p className="text-muted mb-0 small text-truncate" style={{ fontSize: '0.75rem' }}>
                  {user?.email}
                </p>
              </div>
              <Link
                to="/settings"
                onClick={() => setShowProfileMenu(false)}
                className="d-flex align-items-center gap-2 px-3 py-2 text-secondary text-decoration-none small hover-bg"
              >
                <User size={15} />
                <span>My Profile</span>
              </Link>
              <Link
                to="/settings"
                onClick={() => setShowProfileMenu(false)}
                className="d-flex align-items-center gap-2 px-3 py-2 text-secondary text-decoration-none small hover-bg"
              >
                <Settings size={15} />
                <span>Preferences</span>
              </Link>
              <div className="dropdown-divider my-1"></div>
              <button
                onClick={async () => {
                  setShowProfileMenu(false);
                  await logout();
                  toast.success('Signed out');
                  navigate('/login');
                }}
                className="btn btn-link w-100 text-start d-flex align-items-center gap-2 px-3 py-2 text-danger text-decoration-none small border-0"
              >
                <LogOut size={15} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
