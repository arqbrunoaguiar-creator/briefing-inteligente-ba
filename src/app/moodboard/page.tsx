"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { styleMoodboards } from '@/data/moodboardData';
import styles from './moodboard.module.css';

export default function MoodboardPage() {
  const [activeStyle, setActiveStyle] = useState(styleMoodboards[0].id);
  const current = styleMoodboards.find(s => s.id === activeStyle)!;

  return (
    <main className={styles.main}>
      {/* AURA NAVY UNIFICADA */}
      <div className={styles.bgSpline}>
        <div className={styles.navyBg}>
          <div className={styles.blob1}></div>
          <div className={styles.blob2}></div>
        </div>
      </div>

      <header className={styles.header} style={{ background: 'rgba(255,255,255,0.9)' }}>
        <Link href="/" className={styles.logoLink}>
          <Image src="/brand/logo-horizontal-light.png" alt="Bruno Aguiar Interiores" width={180} height={40} style={{ filter: 'brightness(0) saturate(100%) invert(8%) sepia(21%) saturate(3133%) hue-rotate(188deg) brightness(92%) contrast(97%)' }} />
        </Link>
        <span className={styles.headerLabel} style={{ color: '#0d1b2a' }}>Moodboards de Estilo</span>
      </header>

      <div className={styles.container}>
        <div className={styles.tabBar} style={{ background: 'rgba(13, 27, 42, 0.05)' }}>
          {styleMoodboards.map(s => (
            <button 
              key={s.id} 
              className={`${styles.tab} ${activeStyle === s.id ? styles.tabActive : ''}`}
              style={{ color: activeStyle === s.id ? '#fff' : '#0d1b2a', background: activeStyle === s.id ? '#0d1b2a' : 'transparent' }}
              onClick={() => setActiveStyle(s.id)}
            >
              {s.name}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStyle}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`glass-panel ${styles.heroCard}`}
            style={{ background: 'rgba(255, 255, 255, 0.85)', color: '#0d1b2a', padding: '3rem', borderRadius: '32px' }}
          >
            <span className={styles.atemporalTag} style={{ background: '#0d1b2a', color: '#fff' }}>AESTHETIC</span>
            <h1 style={{ color: '#0d1b2a', fontSize: '3rem', fontWeight: '400', marginBottom: '0.5rem' }}>{current.name}</h1>
            <p className={styles.subtitle} style={{ color: 'rgba(13, 27, 42, 0.6)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>{current.subtitle}</p>
            <p className={styles.description} style={{ color: '#0d1b2a', lineHeight: '1.7', fontSize: '1.1rem' }}>{current.description}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
