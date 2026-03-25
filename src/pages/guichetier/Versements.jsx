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
  const [ancienMontant, setAncienMontant] = useState(0);
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
        await api.put(`/versements/${editId}`, { montant: form.montant, n_cheque: form.n_cheque });
        toast.success('Versement modifié !');
        setEditId(null);
        setAncienMontant(0);
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

    // Trouver le client dans la liste
    const client = clients.find(c => c.n_compte === v.n_compte) || null;

    // Solde AVANT ce versement = solde actuel − montant de ce versement
    const soldeAvant = client
      ? Number(client.solde) - Number(v.montant)
      : 0;

    // Afficher le solde avant versement (pas le solde actuel)
    setClientSel(client ? { ...client, solde: soldeAvant } : null);
    setAncienMontant(Number(v.montant));

    setForm({
      n_versement: v.n_versement,
      n_cheque:    v.n_cheque || '',
      n_compte:    v.n_compte,
      montant:     v.montant,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior:'smooth' });
  };

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setClientSel(null);
    setAncienMontant(0);
    setForm(f => ({ ...f, n_cheque:'', n_compte:'', montant:'' }));
  };

  // Nouveau solde = soldeAvant + nouveauMontant
  const calculNouveauSolde = () => {
    if (!clientSel || !form.montant) return null;
    return Number(clientSel.solde) + Number(form.montant);
  };

  const total = versements.reduce((s, v) => s + Number(v.montant), 0);

  const inp = {
    width:'100%', padding:'10px 13px',
    border:'1.5px solid #E4E4E7', borderRadius:10,
    fontSize:13, color:'#18181B', background:'#FAFAFA',
    outline:'none', fontFamily:'inherit',
  };

  const fmtCreatedAt = (d) => {
    if (!d) return '—';
    const clean = d.replace('T',' ').split('.')[0];
    const [dp, tp] = clean.split(' ');
    if (!dp || !tp) return d;
    const [, mo, jj] = dp.split('-');
    const [hh, mm]   = tp.split(':');
    return `${jj}/${mo} · ${hh}:${mm}`;
  };

  return (
    <div className="shell">
      <Sidebar role="guichetier" subtitle="Guichetier" badge={versements.length} />
      <div className="main">
        <Topbar breadcrumb="Versements">
          <button className="btn-primary" onClick={() => {
            setShowForm(!showForm);
            if (!showForm) { setEditId(null); setAncienMontant(0); fetchNumero(); }
          }}>
            <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            Nouveau versement
          </button>
        </Topbar>

        <div className="content">
          <div className="page-hd">
            <div>
              <div className="page-title">Mes versements</div>
              <div className="page-sub">Uniquement vos opérations personnelles</div>
            </div>
          </div>

          {/* KPIs */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:18 }}>
            {[
              { icon:'💳', bg:'#EEF2FF', label:'Versements',  value: versements.length, sub:'effectués', color:'#18181B' },
              { icon:'💰', bg:'#ECFDF5', label:'Total versé', value: `${total.toLocaleString('fr-FR')} Ar`, sub:'cumulé', color:'#16A34A' },
              { icon:'🔢', bg:'#FFFBEB', label:'Prochain n°', value: form.n_versement || 'VER-0001', sub:'auto-généré', mono:true },
            ].map((k, i) => (
              <div key={i} style={{ background:'#fff', borderRadius:14, padding:'16px 18px', display:'flex', alignItems:'center', gap:12, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ width:42, height:42, borderRadius:10, background:k.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                  {k.icon}
                </div>
                <div>
                  <div style={{ fontSize:11, color:'#71717A', marginBottom:3 }}>{k.label}</div>
                  <div style={{ fontSize: k.mono ? 15 : 20, fontWeight:800, color: k.color||'#18181B', letterSpacing:'-.02em', lineHeight:1, fontFamily: k.mono ? 'monospace' : 'inherit' }}>
                    {k.value}
                  </div>
                  <div style={{ fontSize:11, color:'#A1A1AA', marginTop:3 }}>{k.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Formulaire */}
          {showForm && (
            <div style={{ background:'#fff', borderRadius:14, padding:'20px 22px', marginBottom:18, boxShadow:'0 1px 4px rgba(0,0,0,0.05)', animation:'slideDown .22s ease' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#18181B' }}>
                    {editId ? `Modifier · ${form.n_versement}` : 'Nouveau versement'}
                  </div>
                  <div style={{ fontSize:12, color:'#A1A1AA', marginTop:2 }}>
                    {editId
                      ? 'Le solde affiché est le solde avant ce versement'
                      : 'Remplissez les informations du versement'}
                  </div>
                </div>
                <button onClick={resetForm}
                  style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#A1A1AA', lineHeight:1 }}>✕</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>

                  {/* N° versement */}
                  <div>
                    <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#3F3F46', marginBottom:5 }}>N° Versement</label>
                    <div style={{ display:'flex', gap:7 }}>
                      <input style={{ ...inp, fontFamily:'monospace', flex:1 }}
                        value={form.n_versement} disabled={!!editId}
                        onChange={e => setForm(f => ({ ...f, n_versement: e.target.value }))} required />
                      {!editId && (
                        <button type="button" onClick={fetchNumero}
                          style={{ padding:'0 12px', border:'1.5px solid #E4E4E7', borderRadius:10, fontSize:16, cursor:'pointer', background:'#FAFAFA', color:'#71717A', flexShrink:0 }}>
                          ↺
                        </button>
                      )}
                    </div>
                  </div>

                  {/* N° chèque */}
                  <div>
                    <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#3F3F46', marginBottom:5 }}>
                      N° Chèque <span style={{ fontWeight:400, color:'#A1A1AA' }}>(optionnel)</span>
                    </label>
                    <input style={inp} placeholder="ex: CH001"
                      value={form.n_cheque}
                      onChange={e => setForm(f => ({ ...f, n_cheque: e.target.value }))} />
                  </div>

                  {/* Client */}
                  <div style={{ gridColumn:'span 2' }}>
                    <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#3F3F46', marginBottom:5 }}>Client</label>
                    <select style={{ ...inp, color: !form.n_compte ? '#A1A1AA' : '#18181B' }}
                      value={form.n_compte}
                      disabled={!!editId}
                      onChange={handleClientChange}
                      required>
                      <option value="">— Sélectionner un client —</option>
                      {clients.map(c => (
                        <option key={c.n_compte} value={c.n_compte}>
                          {c.n_compte} · {c.nomclient}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Carte client avec solde avant/actuel */}
                  {clientSel && (
                    <div style={{ gridColumn:'span 2', padding:'13px 16px', borderRadius:10,
                      background: editId ? '#FFFBEB' : '#EFF6FF',
                      border: `1px solid ${editId ? '#FDE68A' : '#BFDBFE'}`,
                      display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ fontSize:11, fontWeight:700, color: editId ? '#92400E' : '#1D4ED8', marginBottom:3 }}>
                          {editId ? '⚠️ Solde avant ce versement' : '✓ Client sélectionné'}
                        </div>
                        <div style={{ fontSize:14, fontWeight:800, color:'#18181B' }}>{clientSel.nomclient}</div>
                        <div style={{ fontSize:11, color:'#A1A1AA', fontFamily:'monospace' }}>{clientSel.n_compte}</div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:11, color:'#A1A1AA', marginBottom:3 }}>
                          {editId ? 'Solde avant versement' : 'Solde actuel'}
                        </div>
                        <div style={{ fontSize:22, fontWeight:800, color: editId ? '#D97706' : '#16A34A' }}>
                          {Number(clientSel.solde).toLocaleString('fr-FR')} Ar
                        </div>
                        {editId && (
                          <div style={{ fontSize:10, color:'#A1A1AA', marginTop:2 }}>
                            Solde actuel : {(Number(clientSel.solde) + ancienMontant).toLocaleString('fr-FR')} Ar
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Montant */}
                  <div style={{ gridColumn:'span 2' }}>
                    <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#3F3F46', marginBottom:5 }}>
                      {editId ? 'Nouveau montant (Ar)' : 'Montant (Ar)'}
                    </label>
                    <input style={inp} type="number" min="1" placeholder="ex: 5000"
                      value={form.montant}
                      onChange={e => setForm(f => ({ ...f, montant: e.target.value }))}
                      required />
                  </div>

                  {/* Aperçu nouveau solde */}
                  {clientSel && Number(form.montant) > 0 && (
                    <div style={{ gridColumn:'span 2', padding:'12px 16px', borderRadius:10,
                      background:'#F0FDF4', border:'1px solid #BBF7D0',
                      display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, color:'#15803D', marginBottom:2 }}>
                          💡 Nouveau solde après versement
                        </div>
                        <div style={{ fontSize:11, color:'#A1A1AA' }}>
                          {Number(clientSel.solde).toLocaleString('fr-FR')} + {Number(form.montant).toLocaleString('fr-FR')} Ar
                        </div>
                      </div>
                      <div style={{ fontSize:24, fontWeight:800, color:'#16A34A' }}>
                        {calculNouveauSolde()?.toLocaleString('fr-FR')} Ar
                      </div>
                    </div>
                  )}

                  {/* Boutons */}
                  <div style={{ gridColumn:'span 2', display:'flex', gap:10 }}>
                    <button type="submit"
                      style={{ flex:1, padding:'11px', background:'#6366F1', color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                      {editId ? '💾 Enregistrer la modification' : '✅ Enregistrer le versement'}
                    </button>
                    <button type="button" onClick={resetForm}
                      style={{ padding:'11px 20px', background:'transparent', border:'1.5px solid #E4E4E7', borderRadius:10, fontSize:13, color:'#71717A', cursor:'pointer', fontFamily:'inherit' }}>
                      Annuler
                    </button>
                  </div>

                </div>
              </form>
            </div>
          )}

          {/* Tableau */}
          <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #F5F5F5' }}>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:'#18181B' }}>Liste des versements</div>
                <div style={{ fontSize:12, color:'#A1A1AA', marginTop:2 }}>Vos opérations personnelles uniquement</div>
              </div>
              <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:99, background:'#EEF2FF', color:'#3730A3' }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:'#6366F1' }} />
                {versements.length} versement{versements.length > 1 ? 's' : ''}
              </span>
            </div>

            {versements.length === 0 ? (
              <div style={{ padding:'52px 20px', textAlign:'center' }}>
                <div style={{ fontSize:36, marginBottom:12 }}>📭</div>
                <div style={{ fontSize:14, fontWeight:700, color:'#3F3F46', marginBottom:6 }}>Aucun versement</div>
                <div style={{ fontSize:12, color:'#A1A1AA' }}>Cliquez sur « Nouveau versement » pour commencer</div>
              </div>
            ) : (
              <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'fixed' }}>
                <thead>
                  <tr style={{ background:'#FAFAFA' }}>
                    {[
                      { label:'N° Versement', w:125 },
                      { label:'Client',       w:null },
                      { label:'Compte',       w:90  },
                      { label:'N° Chèque',    w:110 },
                      { label:'Montant',      w:120 },
                      { label:'Date',         w:120 },
                      { label:'Actions',      w:80  },
                    ].map(h => (
                      <th key={h.label} style={{ padding:'10px 14px', textAlign:'left', fontSize:12, fontWeight:600, color:'#71717A', borderBottom:'1px solid #F0F0F0', width: h.w || undefined }}>
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {versements.map((v, i) => (
                    <tr key={i}
                      onMouseEnter={e => e.currentTarget.style.background='#FAFAFA'}
                      onMouseLeave={e => e.currentTarget.style.background=''}
                      style={{ borderBottom:'1px solid #F5F5F5' }}>
                      <td style={{ padding:'11px 14px' }}>
                        <span style={{ fontFamily:'monospace', fontWeight:700, fontSize:12, color:'#18181B', background:'#F4F4F5', padding:'3px 7px', borderRadius:5 }}>
                          {v.n_versement}
                        </span>
                      </td>
                      <td style={{ padding:'11px 14px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:26, height:26, borderRadius:6, background:'#DCFCE7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:800, color:'#15803D', flexShrink:0 }}>
                            {v.client?.nomclient?.split(' ').map(n=>n[0]).join('').slice(0,2)}
                          </div>
                          <div style={{ fontSize:13, fontWeight:600, color:'#18181B', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {v.client?.nomclient}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:'11px 14px', fontFamily:'monospace', fontSize:12, color:'#71717A' }}>
                        {v.n_compte}
                      </td>
                      <td style={{ padding:'11px 14px', fontSize:12, color:'#A1A1AA' }}>
                        {v.n_cheque || '—'}
                      </td>
                      <td style={{ padding:'11px 14px', fontSize:13, fontWeight:700, color:'#16A34A' }}>
                        +{Number(v.montant).toLocaleString('fr-FR')} Ar
                      </td>
                      <td style={{ padding:'11px 14px', fontSize:12, color:'#A1A1AA' }}>
                        {fmtCreatedAt(v.created_at)}
                      </td>
                      <td style={{ padding:'11px 14px' }}>
                        <div style={{ display:'flex', gap:4 }}>
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
              <div style={{ padding:'10px 20px', background:'#FAFAFA', borderTop:'1px solid #F0F0F0', display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:12, color:'#A1A1AA' }}>
                  <strong style={{ color:'#18181B' }}>{versements.length}</strong> versements
                </span>
                <span style={{ fontSize:12, color:'#A1A1AA' }}>
                  Total : <strong style={{ color:'#16A34A' }}>{total.toLocaleString('fr-FR')} Ar</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}