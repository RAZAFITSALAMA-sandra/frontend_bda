import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const ROLES = {
  admin:      { pill:'pill-i', av:'av-ind',   tag:'tag-ind',   label:'Admin',      shield:true },
  guichetier: { pill:'pill-g', av:'av-green', tag:'tag-green', label:'Guichetier', shield:false },
  client:     { pill:'pill-a', av:'av-amber', tag:'tag-amber', label:'Client',     shield:false },
};

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState('tous');
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'guichetier' });

  const fetch = () => api.get('/users').then(r => setUsers(r.data));
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/users/${editId}`, { name:form.name, email:form.email, role:form.role });
        toast.success('Utilisateur modifié !');
      } else {
        await api.post('/users', form);
        toast.success('Utilisateur créé !');
      }
      setForm({ name:'', email:'', password:'', role:'guichetier' });
      setEditId(null); setShowForm(false); fetch();
    } catch (err) {
      Swal.fire({ icon:'error', title:'Erreur', text: err.response?.data?.message || 'Erreur serveur', confirmButtonColor:'#6366F1' });
    }
  };

  const handleDelete = async (id, name) => {
    const r = await Swal.fire({ title:`Supprimer ${name} ?`, text:'Action irréversible.', icon:'warning', showCancelButton:true, confirmButtonColor:'#EF4444', cancelButtonColor:'#A1A1AA', cancelButtonText:'Annuler', confirmButtonText:'Supprimer' });
    if (r.isConfirmed) { await api.delete(`/users/${id}`); toast.success('Supprimé'); fetch(); }
  };

  const handleEdit = (u) => {
    setEditId(u.id);
    setForm({ name:u.name, email:u.email, password:'', role:u.role });
    setShowForm(true);
  };

  const filtered = users.filter(u => filter==='tous' || u.role===filter);

  return (
    <div className="shell">
      <Sidebar role="admin" subtitle="Administration" />
      <div className="main">
        <Topbar breadcrumb="Utilisateurs">
          <button className="btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name:'', email:'', password:'', role:'guichetier' }); }}>
            <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            Nouvel utilisateur
          </button>
        </Topbar>
        <div className="content">
          <div className="page-hd fade-up">
            <div>
              <div className="page-title">Gestion des utilisateurs</div>
              <div className="page-sub">Créez et gérez les accès</div>
            </div>
          </div>

          {/* Stats */}
          <div className="kpis g3 fade-up">
            {['admin','guichetier','client'].map(role => {
              const cfg = ROLES[role];
              const count = users.filter(u => u.role===role).length;
              return (
                <div key={role} className="kpi k-ind" style={{ cursor:'pointer' }} onClick={() => setFilter(role)}>
                  <div className="kpi-top">
                    <span className="kpi-lbl">{cfg.label}s</span>
                    <div className={`av-sm ${cfg.av}`} style={{ width:30, height:30, borderRadius:8, fontSize:16 }}>
                      {role==='admin' ? '🛡️' : role==='guichetier' ? '🏦' : '👤'}
                    </div>
                  </div>
                  <div className="kpi-val">{count}</div>
                  <div className="kpi-foot">
                    <span className={`tag ${cfg.tag}`}>compte{count>1?'s':''}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form */}
          {showForm && (
            <div className="form-card slide-down">
              <div className="form-title">
                <span className="form-title-text">{editId ? 'Modifier utilisateur' : 'Nouvel utilisateur'}</span>
                <button className="form-close" onClick={() => { setShowForm(false); setEditId(null); }}>✕</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div>
                    <label className="f-label">Nom complet</label>
                    <input className="f-input" placeholder="ex: Jean Dupont" value={form.name}
                      onChange={e => setForm(f=>({...f, name:e.target.value}))} required />
                  </div>
                  <div>
                    <label className="f-label">Email</label>
                    <input className="f-input" type="email" placeholder="ex: jean@bank.com" value={form.email}
                      onChange={e => setForm(f=>({...f, email:e.target.value}))} required />
                  </div>
                  {!editId && (
                    <div>
                      <label className="f-label">Mot de passe</label>
                      <input className="f-input" type="password" placeholder="min. 6 caractères" value={form.password}
                        onChange={e => setForm(f=>({...f, password:e.target.value}))} required minLength={6} />
                    </div>
                  )}
                  <div style={editId ? { gridColumn:'span 2' } : {}}>
                    <label className="f-label">Rôle</label>
                    <select className="f-input" value={form.role} onChange={e => setForm(f=>({...f, role:e.target.value}))}>
                      <option value="admin">Admin</option>
                      <option value="guichetier">Guichetier</option>
                      <option value="client">Client</option>
                    </select>
                  </div>
                  {/* Preview */}
                  <div className="form-span2">
                    <div style={{ padding:'10px 14px', borderRadius:10,
                      background: form.role==='admin'?'#EEF2FF': form.role==='guichetier'?'#F0FDF4':'#FEF9C3',
                      border:`1px solid ${form.role==='admin'?'#C7D2FE':form.role==='guichetier'?'#BBF7D0':'#FDE68A'}`,
                      display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontSize:18 }}>
                        {form.role==='admin'?'🛡️':form.role==='guichetier'?'🏦':'👤'}
                      </span>
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, color: form.role==='admin'?'#4338CA':form.role==='guichetier'?'#15803D':'#B45309' }}>
                          {ROLES[form.role]?.label}
                        </div>
                        <div style={{ fontSize:11, color:'#A1A1AA' }}>
                          {form.role==='admin' && 'Accès complet — gère utilisateurs, clients et audit'}
                          {form.role==='guichetier' && 'Peut créer, modifier et supprimer des versements'}
                          {form.role==='client' && 'Peut uniquement consulter son solde'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="form-span2 form-actions">
                    <button type="submit" className="btn-submit">
                      {editId ? '💾 Enregistrer les modifications' : '✅ Créer l\'utilisateur'}
                    </button>
                    <button type="button" className="btn-cancel"
                      onClick={() => { setShowForm(false); setEditId(null); }}>
                      Annuler
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Table */}
          <div className="tcard fade-up fade-up-1">
            <div className="tcard-head">
              <div>
                <div className="tcard-title">Liste des utilisateurs</div>
                <div className="tcard-sub">{filtered.length} compte{filtered.length>1?'s':''}</div>
              </div>
              <div className="tcard-acts">
                {['tous','admin','guichetier','client'].map(f => (
                  <button key={f} className={`filter-btn ${filter===f?'active':''}`} onClick={() => setFilter(f)}>
                    {f==='tous' ? 'Tous' : ROLES[f]?.label}
                  </button>
                ))}
              </div>
            </div>
            {filtered.length === 0 ? (
              <div style={{ padding:'40px 20px', textAlign:'center', color:'#A1A1AA', fontSize:13 }}>Aucun utilisateur</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Email</th>
                    <th style={{ width:130 }}>Rôle</th>
                    <th style={{ width:100 }}>Statut</th>
                    <th style={{ width:90 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => {
                    const cfg = ROLES[u.role];
                    const ini = u.name.split(' ').map(n=>n[0]).join('').slice(0,2);
                    return (
                      <tr key={i}>
                        <td>
                          <div className="av-cell">
                            <div className={`av-sm ${cfg.av}`}>{ini}</div>
                            <div>
                              <div className="cell-name">{u.name}</div>
                              <div className="cell-meta">ID #{u.id}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize:12, color:'#71717A' }}>{u.email}</td>
                        <td>
                          <span className={`pill ${cfg.pill}`}>
                            <span className="pill-dot"></span>
                            {cfg.label}
                          </span>
                        </td>
                        <td><span className="tag tag-green">Actif</span></td>
                        <td>
                          <div className="row-acts">
                            <button className="ra" onClick={() => handleEdit(u)} title="Modifier">
                              <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                            </button>
                            {u.id !== user?.id && (
                              <button className="ra" onClick={() => handleDelete(u.id, u.name)} title="Supprimer">
                                <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            <div className="tcard-foot">
              <span className="tcard-foot-stat"><span>{users.length}</span> utilisateurs au total</span>
              <span className="tcard-foot-stat">Tous actifs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}