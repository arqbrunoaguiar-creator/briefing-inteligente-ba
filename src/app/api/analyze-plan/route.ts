import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

// Helper: esperar N ms
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

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

    // Validar tamanho (máx 4MB)
    const bytes = await file.arrayBuffer();
    if (bytes.byteLength > 4 * 1024 * 1024) {
      return NextResponse.json({
        rooms: ['suite-master', 'cozinha', 'sala-estar', 'lavabo', 'home-office', 'banheiro', 'area-servico', 'varanda'],
        analysis: 'Arquivo muito grande (máx 4MB). Reduza a resolução e tente novamente.',
        simulated: true,
      });
    }

    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'image/jpeg';

    const prompt = `Analise esta planta baixa de imóvel e identifique os ambientes/cômodos visíveis.

Responda SOMENTE com um JSON puro (sem markdown, sem crases):
{"rooms": ["suite-master", "cozinha"], "analysis": "Descrição breve em português"}

Chaves válidas: suite-master, cozinha, sala-estar, lavabo, home-office, banheiro, area-servico, varanda, quarto
Inclua APENAS os ambientes que identificar. Se houver 2 banheiros, coloque "banheiro" apenas uma vez.`;

    // Tentar até 2x com retry em caso de 429
    let lastError = '';
    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt > 0) await wait(5000); // Espera 5s antes de tentar de novo

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [{ parts: [
                { inline_data: { mime_type: mimeType, data: base64 } },
                { text: prompt },
              ]}],
              generationConfig: { temperature: 0.1 },
            }),
          }
        );

        clearTimeout(timeout);

        if (response.status === 429) {
          lastError = 'Limite de requisições atingido. Aguarde 1 minuto e tente novamente.';
          continue; // Tenta de novo
        }

        if (!response.ok) {
          lastError = `Erro na API (${response.status})`;
          continue;
        }

        const result = await response.json();
        const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Parsear JSON
        let parsed;
        try {
          const jsonStr = textContent.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
          parsed = JSON.parse(jsonStr);
        } catch {
          // Regex fallback
          const roomMatches = textContent.match(/"(suite-master|cozinha|sala-estar|lavabo|home-office|banheiro|area-servico|varanda|quarto)"/g);
          parsed = roomMatches
            ? { rooms: [...new Set(roomMatches.map((m: string) => m.replace(/"/g, '')))], analysis: 'Detecção parcial.' }
            : null;
        }

        if (parsed?.rooms?.length) {
          return NextResponse.json({ rooms: parsed.rooms, analysis: parsed.analysis || '', simulated: false });
        }

        lastError = 'IA não conseguiu identificar ambientes nesta imagem.';
        continue;

      } catch (err: any) {
        if (err?.name === 'AbortError') {
          lastError = 'Timeout na análise. Tente com uma imagem menor.';
        } else {
          lastError = 'Erro de conexão com a IA.';
        }
        continue;
      }
    }

    // Se todas as tentativas falharam, retorna fallback com a mensagem
    return NextResponse.json({
      rooms: ['suite-master', 'cozinha', 'sala-estar', 'banheiro'],
      analysis: lastError + ' Ambientes básicos carregados.',
      simulated: true,
    });

  } catch (error) {
    console.error('Erro no endpoint:', error);
    return NextResponse.json({
      rooms: ['suite-master', 'cozinha', 'sala-estar', 'banheiro'],
      analysis: 'Erro interno. Ambientes básicos carregados.',
      simulated: true,
    });
  }
}
