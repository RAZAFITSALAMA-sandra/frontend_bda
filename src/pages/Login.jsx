import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      Swal.fire({ icon:'success', title:`Bienvenue, ${user.name} !`, timer:1400, showConfirmButton:false, iconColor:'#6366F1' });
      setTimeout(() => {
        if (user.role === 'admin')           navigate('/admin/dashboard');
        else if (user.role === 'guichetier') navigate('/guichetier/versements');
        else                                 navigate('/client/solde');
      }, 1500);
    } catch {
      Swal.fire({ icon:'error', title:'Identifiants incorrects', text:'Vérifiez votre email et mot de passe.', confirmButtonColor:'#6366F1' });
    } finally { setLoading(false); }
  };

  const fill = (mail) => { setEmail(mail); setPassword('password'); };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#F4F4F8', fontFamily:"'Inter', sans-serif" }}>

      {/* Left panel */}
      <div style={{ width:340, background:'#18181B', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'44px 36px', flexShrink:0 }}>
        <div>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:48 }}>
            <div style={{ width:36, height:36, background:'#6366F1', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="17" height="17" fill="white" viewBox="0 0 24 24">
                <path d="M4 10h16v10H4V10zm8-7L2 8h20L12 3z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:800, color:'#FAFAFA', letterSpacing:'-.02em' }}>ProjetBDA</div>
              <div style={{ fontSize:10, color:'#52525B', letterSpacing:'.02em' }}>Système bancaire</div>
            </div>
          </div>

          {/* Headline */}
          <div style={{ marginBottom:40 }}>
            <div style={{ fontSize:26, fontWeight:800, color:'#FAFAFA', letterSpacing:'-.04em', lineHeight:1.2, marginBottom:12 }}>
              Bienvenue<br/>sur votre espace
            </div>
            <div style={{ fontSize:13, color:'#52525B', lineHeight:1.7 }}>
              Gérez les versements et suivez les comptes bancaires en temps réel.
            </div>
          </div>

          {/* Role cards */}
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              { role:'Admin',      desc:'Gestion complète du système',  icon:'🛡️', color:'#312E81', bg:'rgba(99,102,241,0.15)' },
              { role:'Guichetier', desc:'Saisie et suivi des versements', icon:'💳', color:'#14532D', bg:'rgba(34,197,94,0.12)' },
              { role:'Client',     desc:'Consultation du solde',          icon:'👤', color:'#3B1F6A', bg:'rgba(139,92,246,0.15)' },
            ].map(r => (
              <div key={r.role} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:r.bg, borderRadius:9, border:'1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize:16 }}>{r.icon}</span>
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:'#E4E4E7' }}>{r.role}</div>
                  <div style={{ fontSize:10, color:'#71717A' }}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize:10, color:'#3F3F46', letterSpacing:'.06em', textTransform:'uppercase' }}>
          Projet BDA · 2026
        </div>
      </div>

      {/* Right — form */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:32 }}>
        <div style={{ width:'100%', maxWidth:360 }}>
          <div style={{ marginBottom:32 }}>
            <div style={{ fontSize:24, fontWeight:800, color:'#09090B', letterSpacing:'-.04em', marginBottom:6 }}>
              Connexion
            </div>
            <div style={{ fontSize:13, color:'#71717A' }}>
              Entrez vos identifiants pour accéder à votre espace
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#3F3F46', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6 }}>
                Email
              </label>
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 13px', border:`1.5px solid ${email ? '#6366F1' : '#E4E4E7'}`, borderRadius:10, background: email ? '#EEF2FF' : '#fff', transition:'all .2s', boxShadow: email ? '0 0 0 3px rgba(99,102,241,0.08)' : 'none' }}>
                <svg width="13" height="13" fill={email ? '#6366F1' : '#A1A1AA'} viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com"
                  style={{ background:'transparent', border:'none', outline:'none', fontSize:13, color:'#18181B', flex:1, fontFamily:"'Inter', sans-serif" }}
                  required />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom:24 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#3F3F46', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6 }}>
                Mot de passe
              </label>
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 13px', border:`1.5px solid ${password ? '#6366F1' : '#E4E4E7'}`, borderRadius:10, background: password ? '#EEF2FF' : '#fff', transition:'all .2s', boxShadow: password ? '0 0 0 3px rgba(99,102,241,0.08)' : 'none' }}>
                <svg width="13" height="13" fill={password ? '#6366F1' : '#A1A1AA'} viewBox="0 0 24 24">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  style={{ background:'transparent', border:'none', outline:'none', fontSize:13, color:'#18181B', flex:1, fontFamily:"'Inter', sans-serif", letterSpacing: showPass ? 0 : '.1em' }}
                  required />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ background:'none', border:'none', cursor:'pointer', padding:2 }}>
                  <svg width="13" height="13" fill="#A1A1AA" viewBox="0 0 24 24">
                    <path d={showPass
                      ? "M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                      : "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                    }/>
                  </svg>
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ width:'100%', padding:'12px', background: loading ? '#818CF8' : '#6366F1', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:800, cursor: loading ? 'not-allowed':'pointer', fontFamily:"'Inter', sans-serif", transition:'background .15s', marginBottom:20 }}>
              {loading ? 'Connexion en cours...' : 'Se connecter →'}
            </button>
          </form>

          {/* Test accounts */}
          
           
          </div>
        </div>
      </div>
  );
}