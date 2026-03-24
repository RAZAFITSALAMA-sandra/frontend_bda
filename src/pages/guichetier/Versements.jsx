import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

export default function Versements() {
  const [versements, setVersements] = useState([]);
  const [clients, setClients]       = useState([]);
  const [clientSel, setClientSel]   = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [editId, setEditId]         = useState(null);
  const [form, setForm] = useState({ n_versement:'', n_cheque:'', n_compte:'', montant:'' });

  const fetchAll = async () => {
    const [v, c] = await Promise.all([api.get('/versements'), api.get('/clients')]);
    setVersements(v.data);
    setClients(c.data);
  };

  const fetchNumero = async () => {
    const res = await api.get('/prochain-numero');
    setForm(f => ({ ...f, n_versement: res.data.numero }));
  };

  useEffect(() => { fetchAll(); fetchNumero(); }, []);

  const handleClientChange = (e) => {
    const val = e.target.value;
    setForm(f => ({ ...f, n_compte: val }));
    setClientSel(clients.find(c => c.n_compte === val) || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/versements/${editId}`, { montant:form.montant, n_cheque:form.n_cheque });
        toast.success('Versement modifié !');
        setEditId(null);
      } else {
        await api.post('/versements', form);
        toast.success('Versement enregistré !');
        fetchNumero();
      }
      setForm(f => ({ ...f, n_cheque:'', n_compte:'', montant:'' }));
      setClientSel(null);
      setShowForm(false);
      fetchAll();
    } catch (err) {
      Swal.fire({ icon:'error', title:'Erreur', text: err.response?.data?.message || 'Erreur serveur', confirmButtonColor:'#6366F1' });
    }
  };

  const handleDelete = async (id) => {
    const r = await Swal.fire({
      title: 'Supprimer ce versement ?',
      text: 'Le solde du client sera recalculé automatiquement.',
      icon:'warning', showCancelButton:true,
      confirmButtonColor:'#EF4444', cancelButtonColor:'#A1A1AA',
      cancelButtonText:'Annuler', confirmButtonText:'Supprimer',
    });
    if (r.isConfirmed) {
      try {
        await api.delete(`/versements/${id}`);
        toast.success('Versement supprimé !');
        fetchAll();
      } catch (err) {
        Swal.fire({ icon:'error', title:'Erreur', text: err.response?.data?.message, confirmButtonColor:'#6366F1' });
      }
    }
  };

  const handleEdit = (v) => {
    setEditId(v.id);
    setClientSel(clients.find(c => c.n_compte === v.n_compte) || null);
    setForm({ n_versement:v.n_versement, n_cheque:v.n_cheque||'', n_compte:v.n_compte, montant:v.montant });
    setShowForm(true);
    window.scrollTo({ top:0, behavior:'smooth' });
  };

  const total = versements.reduce((s, v) => s + Number(v.montant), 0);

  return (
    <div className="shell">
      <Sidebar role="guichetier" subtitle="Guichetier" badge={versements.length} />
      <div className="main">
        <Topbar breadcrumb="Versements">
          <button className="btn-primary" onClick={() => { setShowForm(!showForm); if (!showForm) { setEditId(null); fetchNumero(); } }}>
            <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            Nouveau versement
          </button>
        </Topbar>
        <div className="content">
          <div className="page-hd fade-up">
            <div>
              <div className="page-title">Mes versements</div>
              <div className="page-sub">Uniquement vos opérations personnelles</div>
            </div>
          </div>

          {/* KPIs */}
          <div className="kpis g3 fade-up">
            <div className="kpi k-ind">
              <div className="kpi-top">
                <span className="kpi-lbl">Versements</span>
                <div className="kpi-ico" style={{ background:'#EEF2FF' }}>
                  <svg viewBox="0 0 24 24" style={{ fill:'#6366F1' }}><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
                </div>
              </div>
              <div className="kpi-val">{versements.length}</div>
              <div className="kpi-foot"><span className="tag tag-ind">effectués</span></div>
            </div>
            <div className="kpi k-green">
              <div className="kpi-top">
                <span className="kpi-lbl">Total versé</span>
                <div className="kpi-ico" style={{ background:'#DCFCE7' }}>
                  <svg viewBox="0 0 24 24" style={{ fill:'#16A34A' }}><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
                </div>
              </div>
              <div className="kpi-val" style={{ fontSize:18 }}>{total.toLocaleString('fr-FR')} Ar</div>
              <div className="kpi-foot"><span className="tag tag-green">cumulé</span></div>
            </div>
            <div className="kpi k-amber">
              <div className="kpi-top">
                <span className="kpi-lbl">Prochain n°</span>
                <div className="kpi-ico" style={{ background:'#FEF9C3' }}>
                  <svg viewBox="0 0 24 24" style={{ fill:'#D97706' }}><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/></svg>
                </div>
              </div>
              <div className="kpi-val" style={{ fontSize:16, fontFamily:'monospace' }}>{form.n_versement || 'VER-0001'}</div>
              <div className="kpi-foot"><span className="tag tag-amber">auto-généré</span></div>
            </div>
          </div>

          {/* Form */}
          {showForm && (
            <div className="form-card slide-down">
              <div className="form-title">
                <span className="form-title-text">{editId ? 'Modifier le versement' : 'Nouveau versement'}</span>
                <button className="form-close" onClick={() => { setShowForm(false); setEditId(null); setClientSel(null); }}>✕</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div>
                    <label className="f-label">
                      N° Versement
                      <span style={{ background:'#EEF2FF', color:'#4338CA', fontSize:9, padding:'1px 7px', borderRadius:99, textTransform:'none', letterSpacing:0 }}>auto</span>
                    </label>
                    <div className="f-input-row">
                      <input className="f-input" value={form.n_versement} disabled={!!editId}
                        onChange={e => setForm(f=>({...f, n_versement:e.target.value}))}
                        style={{ fontFamily:'monospace' }} required />
                      {!editId && (
                        <button type="button" className="f-refresh" onClick={fetchNumero}>↺</button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="f-label">
                      N° Chèque
                      <span style={{ textTransform:'none', letterSpacing:0, color:'#A1A1AA', fontWeight:400 }}>(optionnel)</span>
                    </label>
                    <input className="f-input" placeholder="ex: CH001" value={form.n_cheque}
                      onChange={e => setForm(f=>({...f, n_cheque:e.target.value}))} />
                  </div>
                  <div className="form-span2">
                    <label className="f-label">Client</label>
                    <select className="f-input" value={form.n_compte} disabled={!!editId}
                      onChange={handleClientChange} required>
                      <option value="">— Sélectionner un client —</option>
                      {clients.map(c => (
                        <option key={c.n_compte} value={c.n_compte}>
                          {c.n_compte} · {c.nomclient} · Solde : {Number(c.solde).toLocaleString('fr-FR')} Ar
                        </option>
                      ))}
                    </select>
                  </div>
                  {clientSel && (
                    <div className="form-span2 info-box-blue">
                      <div>
                        <div style={{ fontSize:10, fontWeight:700, color:'#1D4ED8', marginBottom:2 }}>Client sélectionné</div>
                        <div style={{ fontSize:14, fontWeight:800, color:'#09090B' }}>{clientSel.nomclient}</div>
                        <div style={{ fontSize:11, color:'#A1A1AA', fontFamily:'monospace' }}>{clientSel.n_compte}</div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:10, color:'#A1A1AA', marginBottom:2 }}>Solde actuel</div>
                        <div style={{ fontSize:20, fontWeight:800, color:'#16A34A' }}>
                          {Number(clientSel.solde).toLocaleString('fr-FR')} Ar
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="form-span2">
                    <label className="f-label">Montant (Ar)</label>
                    <input className="f-input" type="number" min="1" placeholder="ex: 5000"
                      value={form.montant} onChange={e => setForm(f=>({...f, montant:e.target.value}))} required />
                  </div>
                  {clientSel && form.montant > 0 && (
                    <div className="form-span2 info-box-green">
                      <span style={{ fontSize:12, fontWeight:700, color:'#15803D' }}>
                        💡 Nouveau solde après versement
                      </span>
                      <span style={{ fontSize:18, fontWeight:800, color:'#16A34A' }}>
                        {(Number(clientSel.solde) + Number(form.montant)).toLocaleString('fr-FR')} Ar
                      </span>
                    </div>
                  )}
                  <div className="form-span2 form-actions">
                    <button type="submit" className="btn-submit">
                      {editId ? '💾 Enregistrer modification' : '✅ Enregistrer le versement'}
                    </button>
                    <button type="button" className="btn-cancel"
                      onClick={() => { setShowForm(false); setEditId(null); setClientSel(null); setForm(f=>({...f, n_cheque:'', n_compte:'', montant:''})); }}>
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
                <div className="tcard-title">Liste des versements</div>
                <div className="tcard-sub">Vos opérations personnelles uniquement</div>
              </div>
              <span className="pill pill-i">
                <span className="pill-dot"></span>
                {versements.length} versement{versements.length>1?'s':''}
              </span>
            </div>
            {versements.length === 0 ? (
              <div style={{ padding:'52px 20px', textAlign:'center' }}>
                <div style={{ fontSize:36, marginBottom:12 }}>📭</div>
                <div style={{ fontSize:14, fontWeight:700, color:'#3F3F46', marginBottom:6 }}>Aucun versement</div>
                <div style={{ fontSize:12, color:'#A1A1AA' }}>Cliquez sur « Nouveau versement » pour commencer</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th style={{ width:125 }}>N° Versement</th>
                    <th>Client</th>
                    <th style={{ width:95 }}>Compte</th>
                    <th style={{ width:115 }}>N° Chèque</th>
                    <th style={{ width:120 }}>Montant</th>
                    <th style={{ width:125 }}>Date</th>
                    <th style={{ width:85 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {versements.map((v, i) => (
                    <tr key={i}>
                      <td><span className="mono">{v.n_versement}</span></td>
                      <td>
                        <div className="av-cell">
                          <div className="av-sm av-green">
                            {v.client?.nomclient?.split(' ').map(n=>n[0]).join('').slice(0,2)}
                          </div>
                          <div className="cell-name">{v.client?.nomclient}</div>
                        </div>
                      </td>
                      <td><span className="mono">{v.n_compte}</span></td>
                      <td style={{ color:'#A1A1AA', fontSize:11 }}>{v.n_cheque || '—'}</td>
                      <td><span className="cell-pos">+{Number(v.montant).toLocaleString('fr-FR')} Ar</span></td>
                      <td style={{ fontSize:11, color:'#A1A1AA' }}>
                        {new Date(v.created_at).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })}
                      </td>
                      <td>
                        <div className="row-acts">
                          <button className="ra" onClick={() => handleEdit(v)} title="Modifier">
                            <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/></svg>
                          </button>
                          <button className="ra" onClick={() => handleDelete(v.id)} title="Supprimer">
                            <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {versements.length > 0 && (
              <div className="tcard-foot">
                <span className="tcard-foot-stat"><span>{versements.length}</span> versements</span>
                <span className="tcard-foot-stat">Total : <span>{total.toLocaleString('fr-FR')} Ar</span></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}