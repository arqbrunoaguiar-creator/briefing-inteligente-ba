"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './admin.module.css';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [briefings, setBriefings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Verifica sessão local
  useEffect(() => {
    const auth = localStorage.getItem('ba_admin_auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  // Carrega briefings do Supabase
  useEffect(() => {
    if (isAuthenticated) {
      loadBriefings();
    }
  }, [isAuthenticated]);

  async function loadBriefings() {
    setLoading(true);
    const { data, error } = await supabase
      .from('briefings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setBriefings(data);
    setLoading(false);
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'ba2025') { // Senha temporária
      localStorage.setItem('ba_admin_auth', 'true');
      setIsAuthenticated(true);
    } else {
      alert('Senha incorreta');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.loginWrap}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.loginCard}>
          <img src="/brand/logo-full-dark.png" alt="BA" style={{ width: '120px', marginBottom: '2rem' }} />
          <h2>Acesso Restrito</h2>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              placeholder="Digite sua senha" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className={styles.btnPrimary} style={{ width: '100%', padding: '1rem' }}>Entrar</button>
          </form>
        </motion.div>
      </div>
    );
  }

  const filtered = briefings.filter(b => 
    b.client_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.title}>DASHBOARD ADMINISTRATIVO</div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            placeholder="Buscar cliente..." 
            className={styles.btnPrimary} 
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', width: '250px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={() => { localStorage.removeItem('ba_admin_auth'); setIsAuthenticated(false); }} className={styles.btnSecondary}>Sair</button>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>Total de Briefings</span>
          <h2 style={{ color: '#C4973D' }}>{briefings.length}</h2>
        </div>
        <div className={styles.statCard}>
          <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>Ativos no Mês</span>
          <h2 style={{ color: '#C4973D' }}>{briefings.filter(b => new Date(b.created_at).getMonth() === new Date().getMonth()).length}</h2>
        </div>
      </div>

      {loading ? (
        <p>Carregando registros...</p>
      ) : (
        <div className={styles.briefingGrid}>
          {filtered.map((b) => (
            <motion.div key={b.id} layout className={styles.card}>
              <div className={styles.cardHeader}>
                {b.client_photo ? (
                  <img src={b.client_photo} alt={b.client_name} className={styles.avatar} />
                ) : (
                  <div className={styles.avatar}>{getInitials(b.client_name || 'C')}</div>
                )}
                <div className={styles.cardBody}>
                  <h3>{b.client_name}</h3>
                  <p>{new Date(b.created_at).toLocaleDateString('pt-BR')}</p>
                  <span className={styles.tag}>{b.project_stage || 'Briefing'}</span>
                </div>
              </div>
              
              <div className={styles.cardActions}>
                <Link href={`/briefing/${b.id}`} className={styles.btnPrimary}>Continuar</Link>
                <Link href={`/dossie/${b.id}`} className={styles.btnSecondary}>Ver Dossiê</Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '4rem', textAlign: 'center' }}>
        <Link href="/" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: '0.9rem' }}>+ Iniciar Novo Briefing</Link>
      </div>
    </div>
  );
}
