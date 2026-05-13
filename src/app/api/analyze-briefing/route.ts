import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60; // Aumentar para análise profunda

export async function POST(req: NextRequest) {
  try {
    const { briefingData } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: 'API Key missing' }, { status: 500 });

    const prompt = `
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
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, response_mime_type: "application/json" }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(JSON.stringify(err));
    }

    const result = await response.json();
    const analysis = JSON.parse(result.candidates[0].content.parts[0].text);

    return NextResponse.json(analysis);

  } catch (error: any) {
    console.error('AI Analysis Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
