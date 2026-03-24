import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/glass.css';

export default function Layout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navAdmin = [
    { path: '/admin/dashboard',  label: 'Dashboard',      icon: '▦'  },
    { path: '/admin/users',      label: 'Utilisateurs',   icon: '👥' },
    { path: '/admin/clients',    label: 'Clients',        icon: '🏦' },
    { path: '/admin/audit',      label: 'Audit',          icon: '📋' },
  ];

  const navGuichetier = [
    { path: '/guichetier/versements', label: 'Versements', icon: '💳' },
  ];

  const nav = user?.role === 'admin' ? navAdmin : navGuichetier;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a1a', fontFamily: 'Inter, sans-serif', position: 'relative' }}>

      {/* Orbes animées */}
      <div className="orb" style={{ width: 500, height: 500, background: '#7c3aed', opacity: 0.10, top: -150, left: -150, animation: 'float 8s ease-in-out infinite' }}/>
      <div className="orb" style={{ width: 400, height: 400, background: '#06b6d4', opacity: 0.08, top: 300, right: -100, animation: 'float 10s ease-in-out infinite 3s' }}/>
      <div className="orb" style={{ width: 350, height: 350, background: '#8b5cf6', opacity: 0.08, bottom: 0, left: '45%', animation: 'float 7s ease-in-out infinite 5s' }}/>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Navbar */}
        <nav style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
            }}>🏦</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>ProjetBDA</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 1 }}>BANKING SYSTEM</div>
            </div>
          </div>

          {/* Nav links */}
          <div style={{ display: 'flex', gap: 4 }}>
            {nav.map(item => {
              const active = location.pathname === item.path;
              return (
                <button key={item.path} onClick={() => navigate(item.path)} style={{
                  background: active ? 'rgba(124,58,237,0.2)' : 'transparent',
                  border: active ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent',
                  color: active ? '#a78bfa' : 'rgba(255,255,255,0.45)',
                  borderRadius: 8,
                  padding: '7px 14px',
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s',
                }}>
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* User + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#34d399' }}>
              <span className="live-dot"/>
              Actif
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34,
                background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff',
              }}>{initials}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{user?.name}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.8 }}>{user?.role}</div>
              </div>
            </div>
            <button className="btn-danger" onClick={logout}>Déconnexion</button>
          </div>
        </nav>

        {/* Page content */}
        <main style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
          {(title || subtitle) && (
            <div style={{ marginBottom: 28 }} className="page-enter">
              {title && (
                <h1 className="gradient-text" style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
                  {title}
                </h1>
              )}
              {subtitle && (
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{subtitle}</p>
              )}
            </div>
          )}
          <div className="page-enter">{children}</div>
        </main>
      </div>
    </div>
  );
}