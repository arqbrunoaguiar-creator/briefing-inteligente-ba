import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 10;

const PROMPT = (briefingData: any) => `Você é consultor estratégico de design de interiores de alto padrão.
Analise este briefing e retorne um JSON COMPACTO e objetivo.

BRIEFING: ${JSON.stringify(briefingData)}

RETORNE APENAS este JSON (sem markdown, sem explicações):
{"archetype":{"name":"NOME","reason":"motivo curto"},"conflicts":[{"type":"Orçamento","issue":"descrição","level":"alto"}],"concept":["diretriz 1","diretriz 2","diretriz 3"],"keywords":["palavra1","palavra2","palavra3"],"complexity":{"score":7,"reason":"motivo curto"},"emotionalState":{"state":"estado","recommendation":"recomendação curta"},"openQuestions":["pergunta 1?","pergunta 2?"],"narrative":"Narrativa profissional em 2 frases."}

REGRAS: Arquétipos disponíveis: Cuidador, Anfitrião, Pragmático, Explorador, Líder, Sonhador. Seja crítico e objetivo. Respostas CURTAS.`;

export async function POST(req: NextRequest) {
  try {
    const { briefingData } = await req.json();
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    // 1. CLAUDE (principal — melhor qualidade, respostas curtas para caber no timeout)
    if (anthropicKey) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5',
            max_tokens: 600,
            messages: [{ role: 'user', content: PROMPT(briefingData) }]
          })
        });
        clearTimeout(timeout);

        if (res.ok) {
          const result = await res.json();
          const text = result.content[0].text.trim();
          const start = text.indexOf('{');
          const end = text.lastIndexOf('}');
          if (start !== -1 && end !== -1) {
            const analysis = JSON.parse(text.substring(start, end + 1));
            return NextResponse.json({ ...analysis, provider: 'claude' });
          }
        }
      } catch (e) {
        console.error('Claude falhou, tentando próximo...', e);
      }
    }

    // 2. OPENAI (backup rápido)
    if (openAiKey) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openAiKey}` },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            max_tokens: 600,
            messages: [{ role: 'user', content: PROMPT(briefingData) }],
            response_format: { type: 'json_object' }
          })
        });
        clearTimeout(timeout);

        if (res.ok) {
          const result = await res.json();
          const analysis = JSON.parse(result.choices[0].message.content);
          return NextResponse.json({ ...analysis, provider: 'openai' });
        }
      } catch (e) {
        console.error('OpenAI falhou, tentando Gemini...', e);
      }
    }

    // 3. GEMINI (terceiro backup)
    if (geminiKey) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: PROMPT(briefingData) }] }],
            generationConfig: { temperature: 0.2, response_mime_type: 'application/json', maxOutputTokens: 600 }
          })
        });
        clearTimeout(timeout);

        if (res.ok) {
          const result = await res.json();
          const analysis = JSON.parse(result.candidates[0].content.parts[0].text);
          return NextResponse.json({ ...analysis, provider: 'gemini' });
        }
      } catch (e) {
        console.error('Gemini falhou...', e);
      }
    }

    return NextResponse.json({ error: 'Todos os provedores falharam. Verifique as chaves de API.' }, { status: 500 });

  } catch (error: any) {
    console.error('AI Analysis Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
