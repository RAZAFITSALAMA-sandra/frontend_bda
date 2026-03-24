import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';

export default function MonSolde() {
  const [compte, setCompte]       = useState(null);
  const [versements, setVersements] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/mon-solde'),
      api.get('/mes-versements-client').catch(() => ({ data:[] })),
    ]).then(([s, v]) => {
      setCompte(s.data);
      setVersements(v.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="shell">
      <Sidebar role="client" subtitle="Espace client" soldeInfo={null} />
      <div className="main" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontSize:14, color:'#A1A1AA' }}>Chargement...</div>
      </div>
    </div>
  );

  const totalRecu = versements.reduce((s, v) => s + Number(v.montant), 0);

  return (
    <div className="shell">
      <Sidebar role="client" subtitle="Espace client" soldeInfo={compte} />
      <div className="main">
        <Topbar breadcrumb="Mon compte">
          <button className="btn-ghost">Déconnexion</button>
        </Topbar>
        <div className="content">
          <div className="page-hd fade-up">
            <div>
              <div className="page-title">Mon compte bancaire</div>
              <div className="page-sub">Solde mis à jour automatiquement à chaque versement reçu</div>
            </div>
          </div>

          {/* KPIs */}
          <div className="kpis g3 fade-up">
            <div className="kpi k-green">
              <div className="kpi-top">
                <span className="kpi-lbl">Solde actuel</span>
                <div className="kpi-ico" style={{ background:'#DCFCE7' }}>
                  <svg viewBox="0 0 24 24" style={{ fill:'#16A34A' }}><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
                </div>
              </div>
              <div className="kpi-val" style={{ fontSize:20 }}>
                {Number(compte?.solde || 0).toLocaleString('fr-FR')} Ar
              </div>
              <div className="kpi-foot">
                <span className="tag tag-green">mis à jour auto</span>
              </div>
            </div>
            <div className="kpi k-ind">
              <div className="kpi-top">
                <span className="kpi-lbl">N° Compte</span>
                <div className="kpi-ico" style={{ background:'#EEF2FF' }}>
                  <svg viewBox="0 0 24 24" style={{ fill:'#6366F1' }}><path d="M4 10h16v10H4V10zm8-7L2 8h20L12 3z"/></svg>
                </div>
              </div>
              <div className="kpi-val" style={{ fontSize:18, fontFamily:'monospace' }}>{compte?.n_compte}</div>
              <div className="kpi-foot"><span className="tag tag-ind">actif</span></div>
            </div>
            <div className="kpi k-amber">
              <div className="kpi-top">
                <span className="kpi-lbl">Dernier versement</span>
                <div className="kpi-ico" style={{ background:'#FEF9C3' }}>
                  <svg viewBox="0 0 24 24" style={{ fill:'#D97706' }}><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
                </div>
              </div>
              <div className="kpi-val" style={{ fontSize:18, color:'#16A34A' }}>
                {versements.length > 0 ? `+${Number(versements[0]?.montant||0).toLocaleString('fr-FR')} Ar` : '—'}
              </div>
              <div className="kpi-foot">
                <span className="tag tag-amber">reçu</span>
                {versements[0] && (
                  <span className="kpi-sub">
                    {new Date(versements[0].created_at).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'})}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Versements table */}
          <div className="tcard fade-up fade-up-1">
            <div className="tcard-head">
              <div>
                <div className="tcard-title">Versements reçus</div>
                <div className="tcard-sub">Historique sur {compte?.n_compte}</div>
              </div>
              <span className="pill pill-g">
                <span className="pill-dot"></span>
                {versements.length} versement{versements.length>1?'s':''}
              </span>
            </div>
            {versements.length === 0 ? (
              <div style={{ padding:'40px 20px', textAlign:'center' }}>
                <div style={{ fontSize:32, marginBottom:10 }}>📭</div>
                <div style={{ fontSize:13, color:'#A1A1AA' }}>Aucun versement reçu pour l'instant</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th style={{ width:130 }}>N° Versement</th>
                    <th style={{ width:150 }}>Date</th>
                    <th style={{ width:140 }}>Montant reçu</th>
                    <th>Solde après versement</th>
                  </tr>
                </thead>
                <tbody>
                  {versements.map((v, i) => (
                    <tr key={i}>
                      <td><span className="mono">{v.n_versement}</span></td>
                      <td style={{ fontSize:11, color:'#A1A1AA' }}>
                        {new Date(v.created_at).toLocaleString('fr-FR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}
                      </td>
                      <td><span className="cell-pos">+{Number(v.montant).toLocaleString('fr-FR')} Ar</span></td>
                      <td style={{ fontSize:13, fontWeight:800, color:'#09090B' }}>
                        {/* On ne peut pas calculer le solde exact après chaque versement sans info du backend */}
                        —
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="tcard-foot">
              <span className="tcard-foot-stat"><span>{versements.length}</span> versements reçus</span>
              <span className="tcard-foot-stat">Total reçu : <span>{totalRecu.toLocaleString('fr-FR')} Ar</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}