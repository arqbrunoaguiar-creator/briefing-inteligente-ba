"use client";
import { useState } from 'react';
import Link from 'next/link';
import styles from './arquiteto.module.css';

const mockBriefings = [
  { id: 'abc123', client: 'Maria Fernanda Silva', date: '2026-05-10', status: 'Respondido', rooms: 6 },
  { id: 'def456', client: 'João Pedro Almeida', date: '2026-05-08', status: 'Pendente', rooms: 4 },
  { id: 'ghi789', client: 'Ana Carolina Mendes', date: '2026-05-05', status: 'Respondido', rooms: 8 },
];

export default function ArquitetoPage() {
  const [showModal, setShowModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [plantUploaded, setPlantUploaded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const handleUpload = () => {
    setPlantUploaded(true);
    setAnalyzing(true);
    setTimeout(() => { setAnalyzing(false); setAnalyzed(true); }, 3000);
  };

  const generatedLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/briefing/novo-${Date.now().toString(36)}`;

  return (
    <main className={styles.main}>
      <div className={styles.ambientLight1} />
      <div className={styles.ambientLight2} />

      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoBold}>BRUNO</span><span className={styles.logoLight}>AGUIAR</span>
        </Link>
        <span className={styles.headerLabel}>Painel do Arquiteto</span>
      </header>

      <div className={styles.container}>
        <div className={styles.topBar}>
          <h1>Meus Briefings</h1>
          <button className="glass-button" onClick={() => setShowModal(true)}>+ Novo Briefing</button>
        </div>

        <div className={styles.briefingList}>
          {mockBriefings.map(b => (
            <div key={b.id} className={`glass-panel ${styles.briefingRow}`}>
              <div className={styles.briefingInfo}>
                <strong>{b.client}</strong>
                <span className={styles.meta}>{b.rooms} ambientes · {b.date}</span>
              </div>
              <span className={`${styles.status} ${b.status === 'Respondido' ? styles.statusDone : styles.statusPending}`}>
                {b.status}
              </span>
              <div className={styles.actions}>
                <Link href={`/briefing/${b.id}`} className={styles.actionLink}>Ver Briefing</Link>
                {b.status === 'Respondido' && <Link href={`/dossie/${b.id}`} className={styles.actionLink}>Ver Dossiê</Link>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className={styles.overlay} onClick={() => { if (!analyzing) setShowModal(false); }}>
          <div className={`glass-panel ${styles.modal}`} onClick={e => e.stopPropagation()}>
            {!analyzed ? (
              <>
                <h2>Novo Briefing</h2>
                <p className={styles.modalDesc}>Preencha os dados do cliente e faça o upload da planta baixa.</p>
                <div className={styles.modalForm}>
                  <label>Nome do cliente</label>
                  <input className="glass-input" placeholder="Nome completo" value={clientName} onChange={e => setClientName(e.target.value)} />
                  <label>E-mail do cliente</label>
                  <input className="glass-input" type="email" placeholder="email@cliente.com" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
                  <label>Planta Baixa</label>
                  {!plantUploaded ? (
                    <div className={styles.uploadZone} onClick={handleUpload}>
                      <span className={styles.uploadIcon}>📐</span>
                      <span>Clique para fazer upload da planta</span>
                      <span className={styles.uploadHint}>PDF, JPG ou PNG</span>
                    </div>
                  ) : analyzing ? (
                    <div className={styles.analyzingBox}>
                      <div className={styles.spinner} />
                      <span>IA analisando a planta baixa...</span>
                      <span className={styles.uploadHint}>Identificando ambientes automaticamente</span>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <h2>✅ Ambientes Detectados</h2>
                <p className={styles.modalDesc}>A IA identificou os seguintes ambientes na planta:</p>
                <div className={styles.detectedRooms}>
                  {['Suíte Master', 'Cozinha', 'Sala de Estar / Jantar', 'Lavabo', 'Home Office', 'Banheiro', 'Área de Serviço', 'Varanda'].map(r => (
                    <div key={r} className={styles.detectedRoom}>✓ {r}</div>
                  ))}
                </div>
                <div className={styles.linkBox}>
                  <label>Link do Briefing para o cliente:</label>
                  <div className={styles.linkRow}>
                    <input className="glass-input" readOnly value={generatedLink} />
                    <button className="glass-button" onClick={() => navigator.clipboard.writeText(generatedLink)}>Copiar</button>
                  </div>
                </div>
                <button className="glass-button" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setShowModal(false)}>Fechar</button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
