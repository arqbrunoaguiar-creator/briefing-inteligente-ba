"use client";
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import styles from '../admin.module.css';

export default function NovoCliente() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [planStatus, setPlanStatus] = useState<'idle' | 'analyzing' | 'done' | 'error'>('idle');
  const [detectedRooms, setDetectedRooms] = useState<string[]>([]);
  const [planAnalysis, setPlanAnalysis] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    clientName: '',
    whatsapp: '',
    photo: '',
    meetingDate: '',
    propertyType: 'Apartamento',
    situation: 'Pronto para reformar',
    observations: ''
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPlanStatus('analyzing');
    setDetectedRooms([]);
    setPlanAnalysis('');

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/analyze-plan', { method: 'POST', body: fd });
      const data = await res.json();

      if (data.rooms && data.rooms.length > 0) {
        setDetectedRooms(data.rooms);
        setPlanAnalysis(data.analysis || '');
        setPlanStatus('done');
      } else {
        setPlanStatus('error');
      }
    } catch {
      setPlanStatus('error');
    }
  };

  const handleSave = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);

    const id = crypto.randomUUID();

    const { error } = await supabase.from('briefings').insert({
      id,
      client_name: formData.clientName,
      status: 'pre',
      client_photo: formData.photo,
      created_at: new Date().toISOString(),
      answers: {
        preRegistration: {
          ...formData,
          detectedRooms: detectedRooms,
          planAnalysis: planAnalysis,
        },
        meeting_date: formData.meetingDate
      },
      rooms: detectedRooms.length > 0 ? detectedRooms : null,
    });

    if (error) {
      console.error("Erro no Supabase:", error);
      alert("Erro ao salvar: " + error.message);
      setLoading(false);
      return;
    }

    localStorage.setItem(`briefing-${id}`, JSON.stringify({
      clientName: formData.clientName,
      meetingDate: formData.meetingDate,
      photo: formData.photo
    }));

    router.push('/admin');
  };

  const roomLabels: Record<string, string> = {
    'suite-master': '🛏 Suíte Master',
    'cozinha': '🍳 Cozinha',
    'sala-estar': '🛋 Sala de Estar',
    'banheiro': '🚿 Banheiro',
    'lavabo': '🚽 Lavabo',
    'home-office': '💻 Home Office',
    'area-servico': '🧺 Área de Serviço',
    'varanda': '🌿 Varanda',
    'quarto': '🛏 Quarto',
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 style={{ color: 'var(--navy)', fontWeight: 700, letterSpacing: '-1px', fontSize: '1.8rem' }}>NOVO PRÉ-CADASTRO</h1>
        <button type="button" onClick={() => router.back()} className={styles.btnAction_secondary} style={{ padding: '0.8rem 2rem', borderRadius: '12px' }}>Voltar</button>
      </header>

      <form onSubmit={handleSave} className={styles.card} style={{ maxWidth: '800px', margin: '0 auto', color: '#14202B' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Nome do Cliente / Casal</label>
            <input type="text" className={styles.searchInput} style={{ width: '100%', maxWidth: '100%', background: '#f8f9fa' }} required
              value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
          </div>
          <div>
            <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Data da Reunião</label>
            <input type="date" className={styles.searchInput} style={{ width: '100%', maxWidth: '100%', background: '#f8f9fa' }} required
              value={formData.meetingDate} onChange={e => setFormData({...formData, meetingDate: e.target.value})} />
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>URL da Foto (opcional)</label>
          <input type="text" className={styles.searchInput} style={{ width: '100%', maxWidth: '100%', background: '#f8f9fa' }} placeholder="https://..."
            value={formData.photo} onChange={e => setFormData({...formData, photo: e.target.value})} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
          <div>
            <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Tipo de Imóvel</label>
            <select className={styles.searchInput} style={{ width: '100%', maxWidth: '100%', background: '#f8f9fa' }}
              value={formData.propertyType} onChange={e => setFormData({...formData, propertyType: e.target.value})}>
              <option>Casa em construção</option>
              <option>Casa pronta</option>
              <option>Apartamento</option>
              <option>Cobertura</option>
              <option>Casa de praia</option>
              <option>Casa de campo</option>
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Situação</label>
            <select className={styles.searchInput} style={{ width: '100%', maxWidth: '100%', background: '#f8f9fa' }}
              value={formData.situation} onChange={e => setFormData({...formData, situation: e.target.value})}>
              <option>Em construção</option>
              <option>Pronto para reformar</option>
              <option>Recém entregue sem móveis</option>
            </select>
          </div>
        </div>

        {/* UPLOAD DA PLANTA BAIXA — agora conectado à IA */}
        <div style={{ marginTop: '2rem' }}>
          <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
            Upload da Planta Baixa (Análise IA de Ambientes)
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            style={{ display: 'block', marginTop: '0.5rem' }}
            onChange={handleFileChange}
          />

          {planStatus === 'analyzing' && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f4ff', borderRadius: '12px', color: '#3b5bdb' }}>
              ⏳ Gemini analisando a planta... aguarde alguns segundos.
            </div>
          )}

          {planStatus === 'done' && detectedRooms.length > 0 && (
            <div style={{ marginTop: '1rem', padding: '1.2rem', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #86efac' }}>
              <p style={{ color: '#15803d', fontWeight: 700, marginBottom: '0.5rem' }}>
                ✅ {detectedRooms.length} ambiente{detectedRooms.length > 1 ? 's' : ''} detectado{detectedRooms.length > 1 ? 's' : ''} pela IA:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {detectedRooms.map(r => (
                  <span key={r} style={{ background: '#dcfce7', color: '#166534', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                    {roomLabels[r] || r}
                  </span>
                ))}
              </div>
              {planAnalysis && (
                <p style={{ marginTop: '0.8rem', color: '#166534', fontSize: '0.85rem' }}>{planAnalysis}</p>
              )}
              <p style={{ marginTop: '0.8rem', color: '#6b7280', fontSize: '0.8rem' }}>
                Esses ambientes serão pré-selecionados no briefing. Você poderá ajustá-los.
              </p>
            </div>
          )}

          {planStatus === 'error' && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef2f2', borderRadius: '12px', color: '#dc2626' }}>
              ⚠️ Não foi possível analisar a planta. Os ambientes serão selecionados manualmente no briefing.
            </div>
          )}
        </div>

        <div style={{ marginTop: '2rem' }}>
          <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Anotações prévias (Suas observações)</label>
          <textarea className={styles.searchInput} style={{ width: '100%', maxWidth: '100%', height: '120px', background: '#f8f9fa', resize: 'none' }}
            value={formData.observations} onChange={e => setFormData({...formData, observations: e.target.value})} />
        </div>

        <button type="submit" className={styles.btnNew} style={{ width: '100%', marginTop: '3rem', textAlign: 'center' }} disabled={loading || planStatus === 'analyzing'}>
          {loading ? 'Salvando...' : planStatus === 'analyzing' ? 'Aguardando análise da planta...' : 'Salvar Pré-cadastro'}
        </button>
      </form>
    </div>
  );
}
