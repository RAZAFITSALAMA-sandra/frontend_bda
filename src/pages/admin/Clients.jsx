import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

export default function Clients() {
  const [clients, setClients]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [search, setSearch]     = useState('');
  const [form, setForm] = useState({
    n_compte:'', nomclient:'', solde:'',
    email:'', password:'',
  });

  const fetchClients = () => api.get('/clients').then(r => setClients(r.data));
  useEffect(() => { fetchClients(); }, []);

  const resetForm = () => {
    setForm({ n_compte:'', nomclient:'', solde:'', email:'', password:'' });
    setShowForm(false);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/clients/${editId}`, { nomclient: form.nomclient });
        toast.success('Client modifié avec succès !');
      } else {
        // 1 — créer l'utilisateur
        const userRes = await api.post('/users', {
          name:     form.nomclient,
          email:    form.email,
          password: form.password,
          role:     'client',
        });
        // 2 — créer le compte bancaire lié
        await api.post('/clients', {
          n_compte:  form.n_compte,
          nomclient: form.nomclient,
          solde:     form.solde || 0,
          user_id:   userRes.data.id,
        });
        toast.success('Client créé avec accès de connexion !');
      }
      resetForm();
      fetchClients();
    } catch (err) {
      Swal.fire({
        icon:'error', title:'Erreur',
        text: err.response?.data?.message || 'Erreur serveur',
        confirmButtonColor:'#6366F1',
      });
    }
  };

  const handleDelete = async (id, nom) => {
    const r = await Swal.fire({
      title: `Supprimer ${nom} ?`,
      text: 'Le compte bancaire sera supprimé.',
      icon:'warning', showCancelButton:true,
      confirmButtonColor:'#EF4444', cancelButtonColor:'#A1A1AA',
      cancelButtonText:'Annuler', confirmButtonText:'Supprimer',
    });
    if (r.isConfirmed) {
      await api.delete(`/clients/${id}`);
      toast.success('Client supprimé');
      fetchClients();
    }
  };

  const handleEdit = (c) => {
    setEditId(c.id);
    setForm({ n_compte:c.n_compte, nomclient:c.nomclient, solde:c.solde, email:'', password:'' });
    setShowForm(true);
  };

  const totalSoldes = clients.reduce((s, c) => s + Number(c.solde), 0);
  const maxSolde    = Math.max(...clients.map(c => Number(c.solde)), 1);
  const filtered    = clients.filter(c =>
    c.nomclient.toLowerCase().includes(search.toLowerCase()) ||
    c.n_compte.toLowerCase().includes(search.toLowerCase())
  );

  const inp = {
    width:'100%', padding:'10px 13px',
    border:'1.5px solid #E4E4E7', borderRadius:10,
    fontSize:13, color:'#18181B', background:'#FAFAFA',
    outline:'none', fontFamily:'inherit',
    transition:'border-color .15s, box-shadow .15s',
  };

  const focusStyle = (e) => {
    e.target.style.borderColor = '#6366F1';
    e.target.style.boxShadow   = '0 0 0 3px rgba(99,102,241,0.08)';
    e.target.style.background  = '#fff';
  };
  const blurStyle = (e) => {
    e.target.style.borderColor = '#E4E4E7';
    e.target.style.boxShadow   = 'none';
    e.target.style.background  = '#FAFAFA';
  };

  return (
    <div className="shell">
      <Sidebar role="admin" subtitle="Administration" />
      <div className="main">
        <Topbar breadcrumb="Clients">
          <button className="btn-primary"
            onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ n_compte:'', nomclient:'', solde:'', email:'', password:'' }); }}>
            <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            Nouveau client
          </button>
        </Topbar>

        <div className="content">
          <div className="page-hd">
            <div>
              <div className="page-title">Comptes bancaires clients</div>
              <div className="page-sub">Gérez les comptes et les accès de connexion</div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:20 }}>
            {[
              { icon:'🏦', bg:'#EEF2FF', label:'Total clients',   value: clients.length,                              sub:'comptes actifs' },
              { icon:'💰', bg:'#ECFDF5', label:'Solde cumulé',    value: `${totalSoldes.toLocaleString('fr-FR')} Ar`, sub:'dans tous les comptes', color:'#16A34A' },
              { icon:'🔗', bg:'#FFFBEB', label:'Comptes liés',    value: `${clients.filter(c=>c.user_id).length}/${clients.length}`, sub:'avec accès de connexion' },
            ].map((s,i) => (
              <div key={i} style={{ background:'#fff', borderRadius:14, padding:'16px 18px', display:'flex', alignItems:'center', gap:14, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ width:42, height:42, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize:12, color:'#71717A', marginBottom:3 }}>{s.label}</div>
                  <div style={{ fontSize:20, fontWeight:800, color: s.color||'#18181B', letterSpacing:'-.02em', lineHeight:1 }}>{s.value}</div>
                  <div style={{ fontSize:11, color:'#A1A1AA', marginTop:3 }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Formulaire */}
          {showForm && (
            <div style={{ background:'#fff', borderRadius:14, padding:'20px 22px', marginBottom:18, boxShadow:'0 1px 4px rgba(0,0,0,0.05)', animation:'slideDown .22s ease' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#18181B' }}>
                    {editId ? 'Modifier le client' : 'Nouveau client'}
                  </div>
                  {!editId && (
                    <div style={{ fontSize:12, color:'#A1A1AA', marginTop:3 }}>
                      Crée le compte bancaire ET l'accès de connexion en une seule étape
                    </div>
                  )}
                </div>
                <button onClick={resetForm}
                  style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#A1A1AA', lineHeight:1 }}>✕</button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Section compte bancaire */}
                {!editId && (
                  <div style={{ marginBottom:16 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'#4338CA', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:14 }}>🏦</span> Compte bancaire
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                      <div>
                        <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#3F3F46', marginBottom:5 }}>N° Compte</label>
                        <input style={{ ...inp, fontFamily:'monospace' }} placeholder="ex: CPT003"
                          value={form.n_compte} onChange={e => setForm(f=>({...f, n_compte:e.target.value}))}
                          onFocus={focusStyle} onBlur={blurStyle} required />
                      </div>
                      <div>
                        <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#3F3F46', marginBottom:5 }}>Nom complet</label>
                        <input style={inp} placeholder="ex: Marie Dupont"
                          value={form.nomclient} onChange={e => setForm(f=>({...f, nomclient:e.target.value}))}
                          onFocus={focusStyle} onBlur={blurStyle} required />
                      </div>
                      <div>
                        <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#3F3F46', marginBottom:5 }}>
                          Solde initial (Ar)
                        </label>
                        <input style={inp} type="number" min="0" placeholder="ex: 50000"
                          value={form.solde} onChange={e => setForm(f=>({...f, solde:e.target.value}))}
                          onFocus={focusStyle} onBlur={blurStyle} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Section modification (edit only) */}
                {editId && (
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#3F3F46', marginBottom:5 }}>Nom du client</label>
                    <input style={inp} placeholder="ex: Marie Dupont"
                      value={form.nomclient} onChange={e => setForm(f=>({...f, nomclient:e.target.value}))}
                      onFocus={focusStyle} onBlur={blurStyle} required />
                  </div>
                )}

                {/* Section accès connexion — création uniquement */}
                {!editId && (
                  <div style={{ marginBottom:18 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'#15803D', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:14 }}>🔐</span> Accès de connexion
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <div>
                        <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#3F3F46', marginBottom:5 }}>Email de connexion</label>
                        <input style={inp} type="email" placeholder="ex: marie@email.com"
                          value={form.email} onChange={e => setForm(f=>({...f, email:e.target.value}))}
                          onFocus={focusStyle} onBlur={blurStyle} required />
                      </div>
                      <div>
                        <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#3F3F46', marginBottom:5 }}>Mot de passe</label>
                        <input style={inp} type="password" placeholder="min. 6 caractères"
                          value={form.password} onChange={e => setForm(f=>({...f, password:e.target.value}))}
                          onFocus={focusStyle} onBlur={blurStyle} required minLength={6} />
                      </div>
                    </div>
                    <div style={{ marginTop:10, padding:'10px 13px', background:'#F0FDF4', borderRadius:9, border:'1px solid #BBF7D0', fontSize:12, color:'#15803D' }}>
                      ✓ Le client utilisera cet email et ce mot de passe pour se connecter et consulter son solde
                    </div>
                  </div>
                )}

                {/* Boutons */}
                <div style={{ display:'flex', gap:10 }}>
                  <button type="submit"
                    style={{ flex:1, padding:'11px', background:'#6366F1', color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'background .15s' }}>
                    {editId ? '💾 Enregistrer les modifications' : '✅ Créer le client et son accès'}
                  </button>
                  <button type="button" onClick={resetForm}
                    style={{ padding:'11px 20px', background:'transparent', border:'1.5px solid #E4E4E7', borderRadius:10, fontSize:13, color:'#71717A', cursor:'pointer', fontFamily:'inherit' }}>
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Barre de recherche */}
          <div style={{ marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fff', borderRadius:10, padding:'9px 14px', boxShadow:'0 1px 3px rgba(0,0,0,0.04)', maxWidth:360 }}>
              <svg width="14" height="14" fill="#A1A1AA" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input placeholder="Rechercher par nom ou n° compte..." value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ background:'transparent', border:'none', outline:'none', fontSize:13, color:'#18181B', fontFamily:'inherit', width:'100%' }} />
            </div>
          </div>

          {/* Tableau */}
          <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #F5F5F5' }}>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:'#18181B' }}>Liste des clients</div>
                <div style={{ fontSize:12, color:'#A1A1AA', marginTop:2 }}>{filtered.length} client{filtered.length>1?'s':''}</div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding:'40px', textAlign:'center' }}>
                <div style={{ fontSize:32, marginBottom:10 }}>🏦</div>
                <div style={{ fontSize:13, color:'#A1A1AA' }}>
                  {search ? 'Aucun résultat pour cette recherche' : 'Aucun client enregistré'}
                </div>
              </div>
            ) : (
              <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'fixed' }}>
                <thead>
                  <tr style={{ background:'#FAFAFA' }}>
                    {[
                      { label:'Client',             w: null },
                      { label:'N° Compte',           w: 100  },
                      { label:'Solde actuel',        w: 130  },
                      { label:'Progression',         w: 130  },
                      { label:'Email de connexion',  w: 180  },
                      { label:'Actions',             w: 80   },
                    ].map(h => (
                      <th key={h.label} style={{ padding:'10px 16px', textAlign:'left', fontSize:12, fontWeight:600, color:'#71717A', borderBottom:'1px solid #F0F0F0', width: h.w || undefined }}>
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => {
                    const pct = Math.min(100, Math.round((Number(c.solde)/maxSolde)*100));
                    const ini = c.nomclient.split(' ').map(n=>n[0]).join('').slice(0,2);
                    return (
                      <tr key={i}
                        onMouseEnter={e => e.currentTarget.style.background='#FAFAFA'}
                        onMouseLeave={e => e.currentTarget.style.background=''}
                        style={{ borderBottom:'1px solid #F5F5F5' }}>
                        <td style={{ padding:'11px 16px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                            <div style={{ width:30, height:30, borderRadius:8, background:'#DCFCE7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'#15803D', flexShrink:0 }}>
                              {ini}
                            </div>
                            <div style={{ fontSize:13, fontWeight:600, color:'#18181B' }}>{c.nomclient}</div>
                          </div>
                        </td>
                        <td style={{ padding:'11px 16px', fontFamily:'monospace', fontWeight:700, fontSize:12, color:'#3F3F46' }}>
                          {c.n_compte}
                        </td>
                        <td style={{ padding:'11px 16px', fontSize:13, fontWeight:700, color:'#16A34A' }}>
                          {Number(c.solde).toLocaleString('fr-FR')} Ar
                        </td>
                        <td style={{ padding:'11px 16px' }}>
                          <div style={{ background:'#F0F0F0', borderRadius:99, height:5, overflow:'hidden', marginBottom:3 }}>
                            <div style={{ height:'100%', width:`${pct}%`, background:'#22C55E', borderRadius:99, transition:'width .5s' }} />
                          </div>
                          <div style={{ fontSize:10, color:'#A1A1AA' }}>{pct}% du max</div>
                        </td>
                        <td style={{ padding:'11px 16px', fontSize:12, color:'#71717A', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {c.user_id
                            ? <span style={{ color:'#16A34A' }}>✓ {c.user?.email || 'Lié'}</span>
                            : <span style={{ color:'#F87171' }}>Pas d'accès</span>
                          }
                        </td>
                        <td style={{ padding:'11px 16px' }}>
                          <div style={{ display:'flex', gap:4 }}>
                            <button className="ra" onClick={() => handleEdit(c)} title="Modifier">
                              <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/></svg>
                            </button>
                            <button className="ra" onClick={() => handleDelete(c.id, c.nomclient)} title="Supprimer">
                              <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* Footer */}
            <div style={{ padding:'10px 20px', background:'#FAFAFA', borderTop:'1px solid #F0F0F0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:12, color:'#A1A1AA' }}>
                <strong style={{ color:'#18181B' }}>{clients.length}</strong> clients au total
              </span>
              <span style={{ fontSize:12, color:'#A1A1AA' }}>
                Solde total : <strong style={{ color:'#16A34A' }}>{totalSoldes.toLocaleString('fr-FR')} Ar</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}