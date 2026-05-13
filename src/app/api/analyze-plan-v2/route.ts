import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { image, filename } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    const prompt = `
      Você é um especialista em leitura de plantas baixas arquitetônicas.
      Analise esta imagem de planta baixa e liste TODOS os ambientes (cômodos) identificados.
      Retorne APENAS um array JSON de strings com os IDs técnicos simplificados.
      Exemplos de IDs: 'suite-master', 'cozinha', 'sala-estar', 'banheiro', 'varanda-gourmet', 'dormitorio-01', 'lavanderia'.

      IMPORTANTE: Retorne APENAS o JSON, sem explicações.
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: "image/png", data: image.split(',')[1] } }
          ]
        }],
        generationConfig: { temperature: 0.1, response_mime_type: "application/json" }
      })
    });

    const result = await response.json();
    const rooms = JSON.parse(result.candidates[0].content.parts[0].text);

    return NextResponse.json({ rooms });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
