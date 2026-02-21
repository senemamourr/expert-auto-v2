import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30 }}>
        <h1>Dashboard - Expertise Auto</h1>
        <button onClick={logout} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Déconnexion
        </button>
      </div>
      <div style={{ background: '#f0f0f0', padding: 20, borderRadius: 8 }}>
        <h2>✅ Connexion réussie !</h2>
        <p style={{ marginTop: 10 }}>Vous êtes connecté à l'application.</p>
        <p style={{ marginTop: 10 }}>Les fonctionnalités complètes seront ajoutées progressivement.</p>
      </div>
    </div>
  );
}
