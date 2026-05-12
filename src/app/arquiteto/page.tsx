"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import styles from './arquiteto.module.css';

export default function ArquitetoDashboard() {
  const [briefings, setBriefings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBriefings() {
      const { data, error } = await supabase
        .from('briefings')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setBriefings(data);
      setLoading(false);
    }
    fetchBriefings();
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.sidebar}>
        <Image src="/brand/logo-icon-dark.png" alt="BA" width={40} height={40} />
        <nav className={styles.nav}>
          <Link href="/arquiteto" className={styles.navActive}>Briefings</Link>
          <Link href="/">Nova Simulação</Link>
        </nav>
      </div>

      <div className={styles.content}>
        <header className={styles.header}>
          <h1>Gestão de Projetos Elite</h1>
          <p>Acompanhe e recupere dossiês estratégicos.</p>
        </header>

        {loading ? (
          <div className={styles.loading}>Sincronizando com a nuvem...</div>
        ) : (
          <div className={styles.grid}>
            {briefings.map((b) => (
              <motion.div key={b.id} whileHover={{ y: -5 }} className={`glass-panel ${styles.briefingCard}`}>
                <div className={styles.cardHeader}>
                  <span className={styles.date}>{new Date(b.created_at).toLocaleDateString('pt-BR')}</span>
                  <span className={styles.status}>Finalizado</span>
                </div>
                <h3>{b.client_name}</h3>
                <p>{b.answers?.family?.spouseName ? `Família: ${b.client_name} & ${b.answers.family.spouseName}` : 'Projeto Individual'}</p>
                <div className={styles.cardActions}>
                  <Link href={`/dossie/${b.id}`} className={styles.viewBtn}>Ver Dossiê</Link>
                  <button onClick={() => window.open(`/dossie/${b.id}`, '_blank')} className={styles.downloadBtn}>Recuperar PDF</button>
                </div>
              </motion.div>
            ))}
            {briefings.length === 0 && <p className={styles.empty}>Nenhum briefing realizado ainda.</p>}
          </div>
        )}
      </div>
    </main>
  );
}
