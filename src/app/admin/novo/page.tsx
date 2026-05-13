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
  const [floorPlan, setFloorPlan] = useState<File | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const id = crypto.randomUUID();
    
    // 1. Lógica de Upload de Foto (Opcional simplificada para Base64 ou URL)
    
    // 2. Criar registro no Supabase
    const { error } = await supabase.from('briefings').insert({
      id,
      client_name: formData.clientName,
      status: 'pre', // Pré-cadastro
      client_photo: formData.photo,
      created_at: new Date().toISOString(),
      answers: {
        preRegistration: formData,
        meeting_date: formData.meetingDate
      }
    });

    if (!error) {
      // Salva no LocalStorage para o fluxo de briefing carregar
      localStorage.setItem(`briefing-${id}`, JSON.stringify({
        clientName: formData.clientName,
        meetingDate: formData.meetingDate,
        photo: formData.photo
      }));
      router.push('/admin');
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>NOVO PRÉ-CADASTRO</h1>
        <button onClick={() => router.back()} className={styles.btnAction_primary}>Cancelar</button>
      </header>

      <form onSubmit={handleSave} style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', padding: '3rem', borderRadius: '25px', color: '#14202B' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <label>Nome do Cliente / Casal</label>
            <input type="text" className={styles.searchInput} style={{ width: '100%', color: '#000', border: '1px solid #ddd' }} required 
              onChange={e => setFormData({...formData, clientName: e.target.value})} />
          </div>
          <div>
            <label>Data da Reunião</label>
            <input type="date" className={styles.searchInput} style={{ width: '100%', color: '#000', border: '1px solid #ddd' }} required
              onChange={e => setFormData({...formData, meetingDate: e.target.value})} />
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <label>URL da Foto (ou deixe vazio para Iniciais)</label>
          <input type="text" className={styles.searchInput} style={{ width: '100%', color: '#000', border: '1px solid #ddd' }}
            onChange={e => setFormData({...formData, photo: e.target.value})} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
          <div>
            <label>Tipo de Imóvel</label>
            <select className={styles.searchInput} style={{ width: '100%', color: '#000', border: '1px solid #ddd' }}
              onChange={e => setFormData({...formData, propertyType: e.target.value})}>
              <option>Casa em construção</option>
              <option>Casa pronta</option>
              <option>Apartamento</option>
              <option>Cobertura</option>
              <option>Casa de praia</option>
              <option>Casa de campo</option>
            </select>
          </div>
          <div>
            <label>Situação</label>
            <select className={styles.searchInput} style={{ width: '100%', color: '#000', border: '1px solid #ddd' }}
              onChange={e => setFormData({...formData, situation: e.target.value})}>
              <option>Em construção</option>
              <option>Pronto para reformar</option>
              <option>Recém entregue sem móveis</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <label>Upload da Planta Baixa (Análise automática por IA)</label>
          <input type="file" accept="image/*,application/pdf" style={{ display: 'block', marginTop: '0.5rem' }} />
        </div>

        <div style={{ marginTop: '2rem' }}>
          <label>Minhas anotações antes da reunião</label>
          <textarea className={styles.searchInput} style={{ width: '100%', height: '100px', color: '#000', border: '1px solid #ddd' }}
            onChange={e => setFormData({...formData, observations: e.target.value})} />
        </div>

        <button type="submit" className={styles.btnNew} style={{ width: '100%', marginTop: '3rem' }}>
          {loading ? 'Salvando...' : 'Salvar Pré-cadastro'}
        </button>
      </form>
    </div>
  );
}
