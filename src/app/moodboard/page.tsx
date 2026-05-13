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
      <div className={styles.bgSpline}>
        <div className={styles.navyBg}>
          <div className={styles.blob1}></div>
          <div className={styles.blob2}></div>
        </div>
      </div>

      <header className={styles.header} style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)' }}>
        <Link href="/admin" className={styles.logoLink}>
          <Image
            src="/brand/BRUNO-AGUIAR-HORIZONTAL---AZUL.png"
            alt="Bruno Aguiar Interiores"
            width={160}
            height={36}
            style={{ objectFit: 'contain' }}
          />
        </Link>
        <span className={styles.headerLabel} style={{ color: '#0d1b2a' }}>Moodboards de Estilo</span>
      </header>

      <div className={styles.container}>
        {/* Tab bar */}
        <div className={styles.tabBar} style={{ background: 'rgba(13,27,42,0.05)' }}>
          {styleMoodboards.map(s => (
            <button
              key={s.id}
              className={`${styles.tab} ${activeStyle === s.id ? styles.tabActive : ''}`}
              style={{
                color: activeStyle === s.id ? '#fff' : '#0d1b2a',
                background: activeStyle === s.id ? '#0d1b2a' : 'transparent'
              }}
              onClick={() => setActiveStyle(s.id)}
            >
              {s.name}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStyle}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className={styles.grid}
          >
            {/* Hero card com imagem */}
            <div className={`glass-panel ${styles.heroCard}`} style={{ background: 'rgba(255,255,255,0.92)', color: '#0d1b2a' }}>
              {current.image ? (
                <div className={styles.heroImg} style={{ backgroundImage: `url(${current.image})` }} />
              ) : (
                <div className={styles.heroImgPlaceholder}>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', letterSpacing: '2px' }}>
                    IMAGEM EM BREVE
                  </p>
                </div>
              )}
              <div className={styles.heroBody}>
                <span className={styles.atemporalTag} style={{ background: '#0d1b2a', color: '#fff' }}>AESTHETIC</span>
                <h1 style={{ color: '#0d1b2a', fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-1px', margin: '0.8rem 0 0.3rem' }}>
                  {current.name}
                </h1>
                <p style={{ color: 'rgba(13,27,42,0.55)', fontSize: '1rem', marginBottom: '1.2rem' }}>{current.subtitle}</p>
                <p style={{ color: '#0d1b2a', lineHeight: 1.7, fontSize: '1rem' }}>{current.description}</p>

                {/* Keywords */}
                <div className={styles.keywordRow}>
                  {current.keywords.map(kw => (
                    <span key={kw} className={styles.keyword}>{kw}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Paleta de cores */}
            <div className={`glass-panel ${styles.paletteCard}`} style={{ background: 'rgba(255,255,255,0.92)' }}>
              <p className={styles.cardLabel}>Paleta de Cores</p>
              <div className={styles.paletteRow}>
                {current.palette.map((color, i) => (
                  <div key={i} className={styles.colorSwatch}>
                    <div className={styles.colorCircle} style={{ background: color }} />
                    <p className={styles.colorName}>{current.paletteNames[i]}</p>
                    <p className={styles.colorHex}>{color}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Materiais */}
            <div className={`glass-panel ${styles.materialsCard}`} style={{ background: 'rgba(255,255,255,0.92)' }}>
              <p className={styles.cardLabel}>Materiais & Acabamentos</p>
              <div className={styles.materialsGrid}>
                {current.materials.map(mat => (
                  <div key={mat.category} className={styles.materialGroup}>
                    <p className={styles.materialCategory}>{mat.category}</p>
                    <div className={styles.materialItems}>
                      {mat.items.map(item => (
                        <span key={item} className={styles.materialTag}>{item}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evitar */}
            <div className={`glass-panel ${styles.avoidCard}`} style={{ background: 'rgba(255,255,255,0.92)' }}>
              <p className={styles.cardLabel}>Evitar neste Estilo</p>
              <div className={styles.avoidList}>
                {current.avoid.map(item => (
                  <div key={item} className={styles.avoidItem}>
                    <span className={styles.avoidDot} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
