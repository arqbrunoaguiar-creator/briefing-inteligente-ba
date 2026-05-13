import { NextRequest, NextResponse } from 'next/server';

// Permite até 60s no plano Pro, 10s no Free
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        rooms: ['suite-master', 'cozinha', 'sala-estar', 'lavabo', 'home-office', 'banheiro', 'area-servico', 'varanda'],
        analysis: 'Modo simulado — GEMINI_API_KEY não configurada.',
        simulated: true,
      });
    }

    // Converter para base64 — limitar a 4MB para evitar timeout
    const bytes = await file.arrayBuffer();
    if (bytes.byteLength > 4 * 1024 * 1024) {
      return NextResponse.json({
        rooms: ['suite-master', 'cozinha', 'sala-estar', 'lavabo', 'home-office', 'banheiro', 'area-servico', 'varanda'],
        analysis: 'Arquivo muito grande (máx 4MB). Ambientes padrão carregados.',
        simulated: true,
      });
    }

    const base64 = Buffer.from(bytes).toString('base64');

    // Forçar mime type para imagem (Gemini não aceita PDF)
    let mimeType = file.type || 'image/jpeg';
    if (mimeType === 'application/pdf') {
      return NextResponse.json({
        rooms: ['suite-master', 'cozinha', 'sala-estar', 'lavabo', 'home-office', 'banheiro', 'area-servico', 'varanda'],
        analysis: 'PDF não suportado para análise visual. Por favor envie JPG ou PNG. Ambientes padrão carregados.',
        simulated: true,
      });
    }

    // Chamada ao Gemini
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: mimeType, data: base64 } },
              { text: `Analise esta planta baixa de imóvel e identifique os ambientes/cômodos visíveis.

Responda SOMENTE com um JSON puro (sem markdown, sem \`\`\`):
{"rooms": ["suite-master", "cozinha"], "analysis": "Descrição breve em português"}

Chaves válidas para rooms:
suite-master, cozinha, sala-estar, lavabo, home-office, banheiro, area-servico, varanda, quarto

Inclua APENAS os que você identificar na planta. Se houver 2 banheiros, coloque "banheiro" apenas uma vez.` },
            ],
          }],
          generationConfig: { temperature: 0.1 },
        }),
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini error:', response.status, errText);
      return NextResponse.json({
        rooms: ['suite-master', 'cozinha', 'sala-estar', 'banheiro'],
        analysis: `Erro na API (${response.status}). Ambientes básicos carregados.`,
        simulated: true,
      });
    }

    const result = await response.json();
    const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let parsed;
    try {
      const jsonStr = textContent.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error('Parse error. Raw text:', textContent);
      // Tenta extrair rooms via regex como último recurso
      const roomMatches = textContent.match(/"(suite-master|cozinha|sala-estar|lavabo|home-office|banheiro|area-servico|varanda|quarto)"/g);
      if (roomMatches) {
        parsed = {
          rooms: [...new Set(roomMatches.map((m: string) => m.replace(/"/g, '')))],
          analysis: 'Detecção parcial realizada.',
        };
      } else {
        parsed = {
          rooms: ['suite-master', 'cozinha', 'sala-estar', 'banheiro'],
          analysis: 'IA não retornou formato esperado. Ambientes básicos carregados.',
        };
      }
    }

    return NextResponse.json({
      rooms: parsed.rooms || [],
      analysis: parsed.analysis || '',
      simulated: false,
    });

  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return NextResponse.json({
        rooms: ['suite-master', 'cozinha', 'sala-estar', 'lavabo', 'banheiro', 'area-servico'],
        analysis: 'Timeout na análise. Ambientes comuns carregados automaticamente.',
        simulated: true,
      });
    }
    console.error('Erro no endpoint:', error);
    return NextResponse.json({
      rooms: ['suite-master', 'cozinha', 'sala-estar', 'banheiro'],
      analysis: 'Erro interno. Ambientes básicos carregados.',
      simulated: true,
    });
  }
}
