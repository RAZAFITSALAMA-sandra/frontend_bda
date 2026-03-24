import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
  ),
  versements: (
    <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
  ),
  clients: (
    <svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
  ),
  users: (
    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
  ),
  audit: (
    <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
  ),
  solde: (
    <svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
  ),
  bank: (
    <svg viewBox="0 0 24 24"><path d="M4 10h16v10H4V10zm8-7L2 8h20L12 3zM6 12v6h2v-6H6zm4 0v6h2v-6h-2zm4 0v6h2v-6h-2z"/></svg>
  ),
};

const ADMIN_MENU = [
  { label: 'Principal', items: [
    { icon: 'dashboard', label: 'Dashboard',    path: '/admin/dashboard' },
    { icon: 'versements',label: 'Versements',   path: '/admin/versements-all' },
    { icon: 'clients',   label: 'Clients',      path: '/admin/clients' },
    { icon: 'users',     label: 'Utilisateurs', path: '/admin/users' },
  ]},
  { label: 'Supervision', items: [
    { icon: 'audit', label: 'Audit', path: '/admin/audit' },
  ]},
];

const GUICHETIER_MENU = [
  { label: 'Menu', items: [
    { icon: 'dashboard',  label: 'Dashboard',   path: '/guichetier/dashboard' },
    { icon: 'versements', label: 'Versements',  path: '/guichetier/versements' },
    { icon: 'clients',    label: 'Clients',     path: '/guichetier/clients' },
  ]},
];

const CLIENT_MENU = [
  { label: 'Menu', items: [
    { icon: 'bank',  label: 'Mon compte', path: '/client/solde' },
    { icon: 'audit', label: 'Historique', path: '/client/historique' },
  ]},
];

export default function Sidebar({ role, subtitle, badge, soldeInfo }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menus = role === 'admin'
    ? ADMIN_MENU
    : role === 'guichetier'
    ? GUICHETIER_MENU
    : CLIENT_MENU;

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="sidebar">
      <div className="sb-top">
        {/* Logo */}
        <div className="sb-logo">
          <div className="sb-logo-mark">{icons.bank}</div>
          <div>
            <div className="sb-logo-text">ProjetBDA</div>
            <div className="sb-logo-sub">{subtitle}</div>
          </div>
        </div>

        {/* Solde client card */}
        {soldeInfo && (
          <div style={{ background: '#27272A', border: '1px solid #3F3F46', borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: '#52525B', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 3 }}>Solde disponible</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#FAFAFA', letterSpacing: '-.04em', lineHeight: 1 }}>
              {Number(soldeInfo.solde || 0).toLocaleString('fr-FR')}
            </div>
            <div style={{ fontSize: 11, color: '#71717A', marginBottom: 10 }}>Ariary</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #3F3F46' }}>
              <div>
                <div style={{ fontSize: 8, color: '#52525B', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>Compte</div>
                <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#A1A1AA' }}>{soldeInfo.n_compte}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 8, color: '#52525B', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>Titulaire</div>
                <div style={{ fontSize: 11, color: '#A1A1AA' }}>{soldeInfo.nomclient?.split(' ')[0]}</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        {menus.map((group, gi) => (
          <div key={gi} className="nav-group">
            <div className="nav-group-lbl">{group.label}</div>
            {group.items.map((item, ii) => (
              <button
                key={ii}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <div className="nav-ico">{icons[item.icon]}</div>
                <span className="nav-lbl">{item.label}</span>
                {item.path === '/guichetier/versements' && badge > 0 && (
                  <span className="nav-badge">{badge}</span>
                )}
              </button>
            ))}
            {gi < menus.length - 1 && <div className="sb-divider" />}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="sb-foot">
        <div className="user-row">
          <div className="user-av">{initials}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.email}</div>
          </div>
          <button className="logout-btn" onClick={logout}>{icons.logout}</button>
        </div>
      </div>
    </div>
  );
}