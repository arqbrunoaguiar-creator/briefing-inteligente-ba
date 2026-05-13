"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './admin.module.css';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [briefings, setBriefings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const auth = localStorage.getItem('ba_admin_auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadBriefings();
  }, [isAuthenticated]);

  async function loadBriefings() {
    setLoading(true);
    const { data } = await supabase.from('briefings').select('*').order('created_at', { ascending: false });
    if (data) setBriefings(data);
    setLoading(false);
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'ba2025') {
      localStorage.setItem('ba_admin_auth', 'true');
      setIsAuthenticated(true);
    } else {
      alert('Senha incorreta');
    }
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  const filtered = briefings.filter(b => {
    const matchesSearch = b.client_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isAuthenticated) {
    return (
      <div className={styles.loginWrap}>
        <div className={styles.loginCard}>
          <img src="/brand/logo-full-dark.png" alt="BA" style={{ width: '120px', marginBottom: '2rem' }} />
          <h2>Acesso Restrito</h2>
          <form onSubmit={handleLogin}>
            <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="submit" className={styles.btnNew} style={{ width: '100%' }}>Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <img src="/brand/logo-full-dark.png" alt="Bruno Aguiar Interiores" className={styles.logo} />
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Buscar por nome..." 
            className={styles.btnAction_secondary} 
            style={{ width: '250px', padding: '0.8rem', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Link href="/admin/novo" className={styles.btnNew}>+ NOVO CLIENTE</Link>
          <button onClick={() => { localStorage.removeItem('ba_admin_auth'); setIsAuthenticated(false); }} className={styles.btnAction_secondary} style={{ padding: '0.8rem' }}>Sair</button>
        </div>
      </header>

      <div className={styles.filters}>
        <input type="text" placeholder="Buscar por nome..." className={styles.searchInput} value={search} onChange={e => setSearch(e.target.value)} />
        <select className={styles.searchInput} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">Todos os Status</option>
          <option value="pre">🔵 Pré-cadastro</option>
          <option value="pro">🟡 Em andamento</option>
          <option value="con">🟢 Concluído</option>
          <option value="arc">⚪ Arquivado</option>
        </select>
      </div>

      {loading ? <p>Carregando...</p> : (
        <div className={styles.clientGrid}>
          <AnimatePresence>
            {filtered.map(b => (
              <motion.div key={b.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.card}>
                <div className={`${styles.statusIndicator} ${styles['status_' + (b.status || 'pre')]}`} />
                <div className={styles.cardHeader}>
                  {b.client_photo ? (
                    <img src={b.client_photo} alt={b.client_name} className={styles.avatar} />
                  ) : (
                    <div className={styles.avatar}>{getInitials(b.client_name || 'C')}</div>
                  )}
                  <div className={styles.cardInfo}>
                    <h3>{b.client_name}</h3>
                    <p>Reunião: {b.answers?.meeting_date || 'A definir'}</p>
                    {b.ai_analysis?.archetype && <span className={styles.archetypeTag}>{b.ai_analysis.archetype.name}</span>}
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <Link href={`/briefing/${b.id}`} className={`${styles.btnAction} ${styles.btnAction_primary}`}>
                    {b.status === 'pre' ? 'Iniciar Briefing' : 'Continuar'}
                  </Link>
                  <Link href={`/dossie/${b.id}`} className={`${styles.btnAction} ${styles.btnAction_secondary}`}>Ver Dossiê</Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
