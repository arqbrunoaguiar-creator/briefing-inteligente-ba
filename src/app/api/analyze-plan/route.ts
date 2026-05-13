import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: 'Nenhum arquivo' }, { status: 400 });

    const openAiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'image/jpeg';

    const prompt = `Analise esta planta baixa e identifique os cômodos. 
    Retorne APENAS um JSON: {"rooms": ["suite-master", "cozinha", "sala-estar", "lavabo", "home-office", "banheiro", "area-servico", "varanda", "quarto"], "analysis": "Descrição curta"}`;

    // 1. TENTAR OPENAI (Se a chave existir)
    if (openAiKey) {
      try {
        console.log("Tentando OpenAI GPT-4o-mini...");
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: prompt },
                  { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } }
                ]
              }
            ],
            response_format: { type: "json_object" }
          })
        });

        if (res.ok) {
          const result = await res.json();
          const parsed = JSON.parse(result.choices[0].message.content);
          return NextResponse.json({ ...parsed, simulated: false, provider: 'openai' });
        }
      } catch (e) {
        console.error("OpenAI falhou, tentando Gemini...", e);
      }
    }

    // 2. FALLBACK PARA GEMINI (Se OpenAI falhar ou não tiver chave)
    if (geminiKey) {
      try {
        console.log("Tentando Gemini Fallback...");
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [
              { inline_data: { mime_type: mimeType, data: base64 } },
              { text: prompt }
            ]}]
          })
        });

        if (res.ok) {
          const result = await res.json();
          const text = result.candidates[0].content.parts[0].text;
          const jsonStr = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
          const parsed = JSON.parse(jsonStr);
          return NextResponse.json({ ...parsed, simulated: false, provider: 'gemini' });
        }
      } catch (e) {
        console.error("Gemini também falhou");
      }
    }

    // 3. SE TUDO FALHAR
    return NextResponse.json({
      rooms: ['suite-master', 'cozinha', 'sala-estar', 'banheiro'],
      analysis: 'Não foi possível analisar agora. Por favor, selecione os cômodos manualmente.',
      simulated: true
    });

  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
