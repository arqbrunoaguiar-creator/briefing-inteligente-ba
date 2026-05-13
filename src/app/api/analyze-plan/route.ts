import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

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

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'image/jpeg';

    const prompt = `Analise esta planta baixa e identifique os ambientes.
Responda APENAS um JSON: {"rooms": ["suite-master", "cozinha"], "analysis": "..."}
Chaves: suite-master, cozinha, sala-estar, lavabo, home-office, banheiro, area-servico, varanda, quarto`;

    // LISTA DE MODELOS PARA TENTAR (Fallback se um estiver sem cota)
    const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b'];
    
    let lastError = '';

    for (const model of models) {
      try {
        console.log(`Tentando modelo: ${model}`);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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
          lastError = `Cota esgotada no modelo ${model}.`;
          continue; // Tenta o próximo modelo
        }

        if (!response.ok) {
          lastError = `Erro no modelo ${model} (Status ${response.status}).`;
          continue;
        }

        const result = await response.json();
        const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

        let parsed;
        try {
          const jsonStr = textContent.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
          parsed = JSON.parse(jsonStr);
        } catch {
          const roomMatches = textContent.match(/"(suite-master|cozinha|sala-estar|lavabo|home-office|banheiro|area-servico|varanda|quarto)"/g);
          parsed = roomMatches ? { rooms: [...new Set(roomMatches.map((m: string) => m.replace(/"/g, '')))] } : null;
        }

        if (parsed?.rooms?.length) {
          return NextResponse.json({ rooms: parsed.rooms, analysis: parsed.analysis || 'Planta analisada com sucesso.', simulated: false });
        }
      } catch (err) {
        lastError = `Falha na conexão com ${model}.`;
      }
    }

    // Se todos os modelos falharem
    return NextResponse.json({
      rooms: ['suite-master', 'cozinha', 'sala-estar', 'lavabo', 'banheiro', 'area-servico'],
      analysis: 'As cotas gratuitas do Gemini para hoje foram atingidas. Ambientes padrão carregados. (Dica: habilite o billing no AI Studio para uso ilimitado).',
      simulated: true,
    });

  } catch (error) {
    return NextResponse.json({
      rooms: ['suite-master', 'cozinha', 'sala-estar', 'banheiro'],
      analysis: 'Erro no servidor. Ambientes básicos carregados.',
      simulated: true,
    });
  }
}
