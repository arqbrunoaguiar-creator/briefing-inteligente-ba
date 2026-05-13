"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import styles from '../admin.module.css';

export default function NovoCliente() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    whatsapp: '',
    photo: '',
    meetingDate: '',
    propertyType: 'Apartamento',
    situation: 'Pronto para reformar',
    observations: ''
  });
  const handleSave = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);

    const id = crypto.randomUUID();
    
    // 1. Lógica de Upload de Foto (Opcional simplificada para Base64 ou URL)
    
    // 2. Criar registro no Supabase
    const { error } = await supabase.from('briefings').insert({
      id,
      client_name: formData.clientName,
      status: 'pre',
      client_photo: formData.photo,
      created_at: new Date().toISOString(),
      answers: {
        preRegistration: formData,
        meeting_date: formData.meetingDate
      }
    });

    if (error) {
      console.error("Erro no Supabase:", error);
      alert("Erro ao salvar: " + error.message);
      setLoading(false);
      return;
    }

    // Salva no LocalStorage para o fluxo de briefing carregar
    localStorage.setItem(`briefing-${id}`, JSON.stringify({
      clientName: formData.clientName,
      meetingDate: formData.meetingDate,
      photo: formData.photo
    }));
    
    router.push('/admin');
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

        <div style={{ marginTop: '2rem' }}>
          <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Upload da Planta Baixa (Para Análise IA)</label>
          <input type="file" accept="image/*,application/pdf" style={{ display: 'block', marginTop: '0.5rem' }} />
        </div>

        <div style={{ marginTop: '2rem' }}>
          <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Anotações prévias (Suas observações)</label>
          <textarea className={styles.searchInput} style={{ width: '100%', maxWidth: '100%', height: '120px', background: '#f8f9fa', resize: 'none' }}
            value={formData.observations} onChange={e => setFormData({...formData, observations: e.target.value})} />
        </div>

        <button type="submit" className={styles.btnNew} style={{ width: '100%', marginTop: '3rem', textAlign: 'center' }} disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Pré-cadastro'}
        </button>
      </form>
    </div>
  );
}
