import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';

const fmtDate = (d) => {
  if (!d) return '—';
  const [datePart, timePart] = d.split(' ');
  if (!datePart || !timePart) return d;
  const [an, mo, jj] = datePart.split('-');
  const [hh, mm] = timePart.split(':');
  const mois = ['jan.','févr.','mars','avr.','mai','juin',
                 'juil.','août','sept.','oct.','nov.','déc.'][parseInt(mo, 10) - 1];
  return `${jj} ${mois} ${an} · ${hh}:${mm}`;
};

const PillAction = ({ type }) => {
  const map = {
    ajout:        { bg:'#ECFDF5', color:'#065F46', dot:'#22C55E', label:'Ajout' },
    modification: { bg:'#FFFBEB', color:'#92400E', dot:'#F59E0B', label:'Modification' },
    suppression:  { bg:'#FFF1F2', color:'#9F1239', dot:'#F43F5E', label:'Suppression' },
  };
  const s = map[type] || {};
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:12, fontWeight:600, padding:'4px 10px', borderRadius:8, background:s.bg, color:s.color }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:s.dot, flexShrink:0 }} />
      {s.label}
    </span>
  );
};

export default function Audit() {
  const [audits, setAudits] = useState([]);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState('tous');

  useEffect(() => {
    api.get('/audit').then(res => {
      setAudits(res.data.audits || []);
      setStats(res.data.stats || {});
    });
  }, []);

  const filtered = filter === 'tous'
    ? audits
    : audits.filter(a => a.type_action === filter);

  const footerStats = [
    { icon:'➕', bg:'#ECFDF5', color:'#16A34A', label:"Nombre d'insertions",    value: stats.insertions    || 0 },
    { icon:'✏️', bg:'#FFFBEB', color:'#D97706', label:'Nombre de modifications', value: stats.modifications || 0 },
    { icon:'🗑️', bg:'#FFF1F2', color:'#DC2626', label:'Nombre de suppressions',  value: stats.suppressions  || 0 },
  ];

  const COLS = [
    { label:'Action',        w:115 },
    { label:'N° Versement',  w:110 },
    { label:'Client',        w:120 },
    { label:'Compte',        w:80  },
    { label:'Ancien montant',   w:105 },
    { label:'Nouveau montant',   w:110 },
    { label:'Guichetier',    w:120 },
    { label:'Date & heure',  w:160 },
  ];

  return (
    <div className="shell">
      <Sidebar role="admin" subtitle="Supervision" />
      <div className="main">
        <Topbar breadcrumb="Journal d'audit" />
        <div className="content">

          <div className="page-hd">
            <div>
              <div className="page-title">Journal d'audit</div>
              <div className="page-sub">Toutes les opérations enregistrées automatiquement par l'Observer</div>
            </div>
          </div>

          <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>

            <div style={{ padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #F5F5F5' }}>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:'#18181B' }}>Toutes les opérations</div>
                <div style={{ fontSize:12, color:'#A1A1AA', marginTop:2 }}>
                  {audits.length} opération{audits.length > 1 ? 's' : ''} au total
                </div>
              </div>
              <div style={{ display:'flex', gap:5 }}>
                {['tous','ajout','modification','suppression'].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    style={{ fontSize:12, fontWeight:600, padding:'5px 13px', borderRadius:7, border:'none', cursor:'pointer', fontFamily:'inherit', transition:'all .15s', background: filter===f ? '#6366F1' : '#F4F4F5', color: filter===f ? '#fff' : '#71717A' }}>
                    {f === 'tous' ? 'Tous' : f.charAt(0).toUpperCase()+f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding:'40px', textAlign:'center', color:'#A1A1AA', fontSize:13 }}>
                Aucune opération trouvée
              </div>
            ) : (
              <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'fixed' }}>
                <thead>
                  <tr style={{ background:'#FAFAFA' }}>
                    {COLS.map(h => (
                      <th key={h.label} style={{ padding:'10px 12px', textAlign:'left', fontSize:12, fontWeight:600, color:'#71717A', borderBottom:'1px solid #F0F0F0', width:h.w }}>
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => (
                    <tr key={i}
                      onMouseEnter={e => e.currentTarget.style.background='#FAFAFA'}
                      onMouseLeave={e => e.currentTarget.style.background=''}
                      style={{ borderBottom:'1px solid #F5F5F5' }}>
                      <td style={{ padding:'11px 12px' }}><PillAction type={a.type_action} /></td>
                      <td style={{ padding:'11px 12px' }}>
                        <span style={{ fontFamily:'monospace', fontWeight:700, fontSize:12, color:'#18181B', background:'#F4F4F5', padding:'3px 7px', borderRadius:5 }}>
                          {a.n_versement}
                        </span>
                      </td>
                      <td style={{ padding:'11px 12px', fontSize:13, fontWeight:600, color:'#18181B', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {a.nomclient}
                      </td>
                      <td style={{ padding:'11px 12px', fontFamily:'monospace', fontSize:12, color:'#71717A', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {a.n_compte}
                      </td>
                      
                      {/* Solde AVANT */}
                      <td style={{ padding:'11px 12px', fontSize:13, fontWeight:500, color:'#71717A' }}>
                        {Number(a.montant_ancien).toLocaleString('fr-FR')} Ar
                      </td>
                      
                      {/* Solde APRÈS */}
                      <td style={{ padding:'11px 12px', fontSize:13, fontWeight:700,
                        color: a.type_action === 'ajout' ? '#16A34A' : 
                               a.type_action === 'modification' ? '#D97706' : 
                               a.type_action === 'suppression' ? '#DC2626' : '#71717A' }}>
                        {Number(a.montant_nouv).toLocaleString('fr-FR')} Ar
                      </td>
                      
                      <td style={{ padding:'11px 12px', fontSize:12, color:'#71717A', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {a.utilisateur}
                      </td>
                      <td style={{ padding:'11px 12px', fontSize:12, color:'#71717A' }}>
                        {fmtDate(a.date_operation)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Footer stats */}
            <div style={{ borderTop:'2px solid #F0F0F0', padding:'16px 20px' }}>
              <div style={{ fontSize:11, fontWeight:600, color:'#A1A1AA', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:12 }}>
                Résumé des opérations
              </div>
              <div style={{ display:'flex' }}>
                {footerStats.map((s, i) => (
                  <div key={i} style={{ flex:1, display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRight: i < footerStats.length-1 ? '1px solid #F0F0F0' : 'none' }}>
                    <div style={{ width:36, height:36, borderRadius:9, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>
                      {s.icon}
                    </div>
                    <div>
                      <div style={{ fontSize:12, color:'#71717A', marginBottom:3 }}>{s.label}</div>
                      <div style={{ fontSize:24, fontWeight:800, color:s.color, letterSpacing:'-.02em', lineHeight:1 }}>
                        {s.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}