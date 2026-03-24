import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';

const fmtDate = (d) => {
  if (!d) return '—';
  const [datePart, timePart] = d.split(' ');
  if (!datePart || !timePart) return d;
  const [an, mo, jj] = datePart.split('-');
  const [hh, mm]     = timePart.split(':');
  const mois = ['jan.','févr.','mars','avr.','mai','juin',
                 'juil.','août','sept.','oct.','nov.','déc.'][parseInt(mo, 10) - 1];
  return `${jj} ${mois} ${an} · ${hh}:${mm}`;
};

const loadChart = (cb) => {
  if (window.Chart) { cb(); return; }
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
  s.onload = cb;
  document.head.appendChild(s);
};

function DonutChart({ insertions, modifications, suppressions }) {
  const ref  = useRef(null);
  const inst = useRef(null);
  const total = insertions + modifications + suppressions;
  const pct = (v) => total > 0 ? Math.round(v / total * 100) : 0;

  useEffect(() => {
    if (!ref.current) return;
    loadChart(() => {
      if (inst.current) inst.current.destroy();
      inst.current = new window.Chart(ref.current, {
        type: 'doughnut',
        data: {
          labels: ['Ajouts','Modifications','Suppressions'],
          datasets: [{
            data: [insertions, modifications, suppressions],
            backgroundColor: ['#22C55E','#F59E0B','#EF4444'],
            borderColor: '#fff',
            borderWidth: 3,
            hoverOffset: 6,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '68%',
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (c) => ` ${c.label} : ${c.raw} (${Math.round(c.raw / (total||1) * 100)}%)`,
              },
            },
          },
        },
      });
    });
    return () => { if (inst.current) inst.current.destroy(); };
  }, [insertions, modifications, suppressions]);

  return (
    <div style={{ display:'flex', alignItems:'center', gap:24 }}>
      <div style={{ position:'relative', width:150, height:150, flexShrink:0 }}>
        <canvas ref={ref} />
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center', pointerEvents:'none' }}>
          <div style={{ fontSize:20, fontWeight:800, color:'#18181B', lineHeight:1 }}>{total}</div>
          <div style={{ fontSize:10, color:'#A1A1AA', marginTop:2 }}>total</div>
        </div>
      </div>
      <div style={{ flex:1 }}>
        {[
          { label:'Ajouts',        value:insertions,    dot:'#22C55E', bg:'#ECFDF5', tc:'#065F46' },
          { label:'Modifications', value:modifications, dot:'#F59E0B', bg:'#FFFBEB', tc:'#92400E' },
          { label:'Suppressions',  value:suppressions,  dot:'#EF4444', bg:'#FFF1F2', tc:'#9F1239' },
        ].map((s, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:9, marginBottom: i < 2 ? 11 : 0 }}>
            <div style={{ width:9, height:9, borderRadius:2, background:s.dot, flexShrink:0 }} />
            <div style={{ flex:1, fontSize:13, color:'#3F3F46' }}>{s.label}</div>
            <div style={{ fontSize:13, fontWeight:700, color:'#18181B', marginRight:6 }}>{s.value}</div>
            <div style={{ fontSize:11, fontWeight:600, background:s.bg, color:s.tc, padding:'2px 8px', borderRadius:99, minWidth:36, textAlign:'center' }}>
              {pct(s.value)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ audits }) {
  const ref  = useRef(null);
  const inst = useRef(null);

  useEffect(() => {
    if (!ref.current || audits.length === 0) return;

    const map = {};
    audits.forEach(a => {
      if (!a.date_operation) return;
      const jour = a.date_operation.split(' ')[0];
      map[jour] = (map[jour] || 0) + 1;
    });
    const jours  = Object.keys(map).sort().slice(-7);
    const vals   = jours.map(j => map[j]);
    const labels = jours.map(j => {
      const [, mo, jj] = j.split('-');
      return `${jj} ${['jan','fév','mar','avr','mai','jui','jul','aoû','sep','oct','nov','déc'][parseInt(mo,10)-1]}`;
    });

    loadChart(() => {
      if (inst.current) inst.current.destroy();
      inst.current = new window.Chart(ref.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Opérations',
            data: vals,
            backgroundColor: '#6366F1',
            borderRadius: 7,
            borderSkipped: false,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (c) => ` ${c.raw} opération${c.raw > 1 ? 's' : ''}` } },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font:{ size:11 }, color:'#A1A1AA', autoSkip: false },
              border: { display: false },
            },
            y: {
              grid: { color:'#F5F5F5' },
              ticks: { font:{ size:11 }, color:'#A1A1AA', precision:0 },
              border: { display: false },
            },
          },
        },
      });
    });
    return () => { if (inst.current) inst.current.destroy(); };
  }, [audits]);

  return (
    <div style={{ position:'relative', width:'100%', height:190 }}>
      <canvas ref={ref} />
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats,  setStats]  = useState({ users:0, clients:0, montant:0, guichetier:'—' });
  const [audits, setAudits] = useState([]);
  const [counts, setCounts] = useState({ insertions:0, modifications:0, suppressions:0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/users'),
      api.get('/clients'),
      api.get('/audit'),
    ]).then(([u, c, a]) => {
      setStats({
        users:      u.data.length,
        clients:    c.data.length,
        montant:    a.data.stats?.montant_total_verse || 0,
        guichetier: a.data.stats?.guichetier_actif   || '—',
      });
      setAudits(a.data.audits || []);
      setCounts({
        insertions:    a.data.stats?.insertions    || 0,
        modifications: a.data.stats?.modifications || 0,
        suppressions:  a.data.stats?.suppressions  || 0,
      });
      setRecent((a.data.audits || []).slice(0, 5));
    });
  }, []);

  const kpis = [
    { icon:'👥', bg:'#EEF2FF', label:'Utilisateurs',     value: stats.users,   sub:'comptes actifs' },
    { icon:'🏦', bg:'#ECFDF5', label:'Clients',          value: stats.clients, sub:'comptes bancaires' },
    { icon:'💰', bg:'#FFFBEB', label:'Total versé',
      value: <span style={{ color:'#16A34A', fontSize:17 }}>{Number(stats.montant).toLocaleString('fr-FR')} Ar</span>,
      sub:'montant cumulé' },
    { icon:'🏆', bg:'#FFF1F2', label:'Guichetier actif',
      value: <span style={{ fontSize:14 }}>{stats.guichetier}</span>,
      sub:'le plus actif' },
  ];

  const pillCfg = {
    ajout:        { bg:'#ECFDF5', color:'#065F46', dot:'#22C55E', label:'Ajout' },
    modification: { bg:'#FFFBEB', color:'#92400E', dot:'#F59E0B', label:'Modification' },
    suppression:  { bg:'#FFF1F2', color:'#9F1239', dot:'#EF4444', label:'Suppression' },
  };

  return (
    <div className="shell">
      <Sidebar role="admin" subtitle="Administration" />
      <div className="main">
        <Topbar breadcrumb="Dashboard">
          <button className="btn-primary" onClick={() => navigate('/guichetier/versements')}>
            <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            Nouveau versement
          </button>
        </Topbar>

        <div className="content">

          {/* KPI */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18 }}>
            {kpis.map((k, i) => (
              <div key={i} style={{ background:'#fff', borderRadius:14, padding:'15px 17px', display:'flex', alignItems:'center', gap:12, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ width:42, height:42, borderRadius:10, background:k.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                  {k.icon}
                </div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:11, color:'#71717A', marginBottom:3 }}>{k.label}</div>
                  <div style={{ fontSize:20, fontWeight:800, color:'#18181B', letterSpacing:'-.02em', lineHeight:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {k.value}
                  </div>
                  <div style={{ fontSize:11, color:'#A1A1AA', marginTop:3 }}>{k.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:18 }}>

            {/* Donut */}
            <div style={{ background:'#fff', borderRadius:14, padding:'18px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:14, fontWeight:700, color:'#18181B' }}>Répartition des opérations</div>
                <div style={{ fontSize:12, color:'#A1A1AA', marginTop:3 }}>
                  Vue d'ensemble des types d'actions sur les versements
                </div>
              </div>
              <DonutChart
                insertions={counts.insertions}
                modifications={counts.modifications}
                suppressions={counts.suppressions}
              />
            </div>

            {/* Bar */}
            <div style={{ background:'#fff', borderRadius:14, padding:'18px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:14, fontWeight:700, color:'#18181B' }}>Activité des 7 derniers jours</div>
                <div style={{ fontSize:12, color:'#A1A1AA', marginTop:3 }}>
                  Nombre d'opérations enregistrées chaque jour
                </div>
              </div>
              <BarChart audits={audits} />
            </div>
          </div>

          {/* Activité récente */}
          <div style={{ background:'#fff', borderRadius:14, padding:'18px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:'#18181B' }}>Activité récente</div>
                <div style={{ fontSize:12, color:'#A1A1AA', marginTop:2 }}>Les 5 dernières opérations enregistrées</div>
              </div>
              <button onClick={() => navigate('/admin/audit')}
                style={{ fontSize:12, fontWeight:600, color:'#6366F1', background:'#EEF2FF', border:'none', borderRadius:7, padding:'5px 13px', cursor:'pointer', fontFamily:'inherit' }}>
                Voir tout →
              </button>
            </div>

            {recent.length === 0 ? (
              <div style={{ padding:'20px', textAlign:'center', color:'#A1A1AA', fontSize:13 }}>Aucune opération</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {recent.map((a, i) => {
                  const p = pillCfg[a.type_action] || {};
                  return (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'#FAFAFA', borderRadius:10 }}>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:99, background:p.bg, color:p.color, flexShrink:0 }}>
                        <span style={{ width:5, height:5, borderRadius:'50%', background:p.dot }} />
                        {p.label}
                      </span>
                      <span style={{ fontFamily:'monospace', fontSize:11, fontWeight:700, color:'#18181B', background:'#EFEFEF', padding:'2px 7px', borderRadius:5, flexShrink:0 }}>
                        {a.n_versement}
                      </span>
                      <span style={{ fontSize:13, fontWeight:600, color:'#18181B', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {a.nomclient}
                      </span>
                      <span style={{ fontSize:13, fontWeight:700, flexShrink:0,
                        color: a.type_action==='suppression'?'#EF4444': a.type_action==='modification'?'#F59E0B':'#22C55E' }}>
                        {a.type_action==='suppression' ? '−' : '+'}{Number(a.montant_nouv).toLocaleString('fr-FR')} Ar
                      </span>
                      <span style={{ fontSize:11, color:'#71717A', flexShrink:0 }}>{a.utilisateur}</span>
                      <span style={{ fontSize:11, color:'#A1A1AA', flexShrink:0 }}>{fmtDate(a.date_operation)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}