import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Converter arquivo para base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'image/jpeg';

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // FALLBACK: Se não há API key, retorna rooms padrão (simulação)
      console.warn('GEMINI_API_KEY não configurada. Usando detecção simulada.');
      return NextResponse.json({
        rooms: [
          'suite-master', 'cozinha', 'sala-estar', 'lavabo',
          'home-office', 'banheiro', 'area-servico', 'varanda'
        ],
        analysis: 'Análise simulada — configure GEMINI_API_KEY para detecção real.',
        simulated: true,
      });
    }

    // Chamar Gemini Vision API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64,
                },
              },
              {
                text: `Você é um assistente especializado em arquitetura de interiores.
Analise esta planta baixa e identifique TODOS os ambientes/cômodos presentes.

Retorne um JSON com esta estrutura EXATA (sem markdown, sem código, apenas o JSON puro):
{
  "rooms": ["suite-master", "cozinha", "sala-estar", "lavabo", "home-office", "banheiro", "area-servico", "varanda", "quarto"],
  "analysis": "Breve descrição da planta em português"
}

Use APENAS estas chaves para os rooms:
- suite-master (suíte master / suíte principal)
- cozinha
- sala-estar (sala de estar, living, sala de jantar)
- lavabo
- home-office (escritório)
- banheiro (banheiro social, WC)
- area-servico (área de serviço, lavanderia)
- varanda (varanda, terraço, sacada, área gourmet)
- quarto (quartos adicionais, quarto de hóspedes, quarto de criança)

Se identificar mais de um quarto ou banheiro, inclua a chave apenas uma vez.
Inclua SOMENTE os ambientes que conseguir identificar na planta.`,
              },
            ],
          }],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', errText);
      return NextResponse.json({ error: 'Erro na API de IA', details: errText }, { status: 500 });
    }

    const result = await response.json();
    const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extrair JSON da resposta
    let parsed;
    try {
      // Remove possíveis blocos de código markdown
      const jsonStr = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Falha ao parsear resposta da IA:', textContent);
      parsed = {
        rooms: ['suite-master', 'cozinha', 'sala-estar', 'banheiro'],
        analysis: 'Detecção parcial — a IA não retornou formato esperado.',
      };
    }

    return NextResponse.json({
      rooms: parsed.rooms || [],
      analysis: parsed.analysis || '',
      simulated: false,
    });

  } catch (error) {
    console.error('Erro no endpoint de análise:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
