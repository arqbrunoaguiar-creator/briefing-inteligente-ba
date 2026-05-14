import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

const PROMPT = (briefingData: any) => `
Você é um consultor estratégico de design de interiores de alto padrão.
Analise os dados deste briefing de um cliente e gere uma análise profunda.

DADOS DO BRIEFING:
${JSON.stringify(briefingData, null, 2)}

RETORNE APENAS UM JSON COM ESTA ESTRUTURA:
{
  "archetype": {
    "name": "...",
    "reason": "..."
  },
  "conflicts": [
    { "type": "Orçamento/Estilo/Prazo", "issue": "...", "level": "alto/médio/baixo" }
  ],
  "concept": ["frase 1", "frase 2", "frase 3"],
  "keywords": ["...", "...", "..."],
  "complexity": {
    "score": 8,
    "reason": "..."
  },
  "emotionalState": {
    "state": "...",
    "recommendation": "..."
  },
  "openQuestions": ["?", "?", "?"],
  "narrative": "..."
}

REGRAS:
- Arquétipos: Escolha entre Cuidador, Anfitrião, Pragmático, Explorador, Líder ou Sonhador.
- Seja crítico sobre Orçamento vs Escopo. Se o cliente quer luxo com orçamento baixo, aponte como conflito ALTO.
- O relatório narrativo deve ser profissional e inspirador.
- Retorne APENAS o JSON, sem markdown ou explicações extras.
`;

export async function POST(req: NextRequest) {
  try {
    const { briefingData } = await req.json();
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    // 1. CLAUDE (principal — melhor qualidade)
    if (anthropicKey) {
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-5',
            max_tokens: 2048,
            messages: [{ role: 'user', content: PROMPT(briefingData) }]
          })
        });

        if (res.ok) {
          const result = await res.json();
          const text = result.content[0].text;
          const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
          const analysis = JSON.parse(jsonStr);
          return NextResponse.json(analysis);
        }
      } catch (e) {
        console.error('Claude falhou, tentando Gemini...', e);
      }
    }

    // 2. GEMINI (backup)
    if (geminiKey) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: PROMPT(briefingData) }] }],
            generationConfig: { temperature: 0.2, response_mime_type: 'application/json' }
          })
        });

        if (res.ok) {
          const result = await res.json();
          const analysis = JSON.parse(result.candidates[0].content.parts[0].text);
          return NextResponse.json(analysis);
        }
      } catch (e) {
        console.error('Gemini falhou...', e);
      }
    }

    return NextResponse.json({ error: 'API Key missing' }, { status: 500 });

  } catch (error: any) {
    console.error('AI Analysis Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
