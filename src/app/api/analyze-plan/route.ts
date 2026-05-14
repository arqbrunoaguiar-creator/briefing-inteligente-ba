import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'Sem arquivo' }, { status: 400 });

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'image/jpeg';

    const prompt = `Analise esta planta baixa e identifique os cômodos. 
    Retorne APENAS um JSON: {"rooms": ["suite-master", "cozinha", "sala-estar", "lavabo", "home-office", "banheiro", "area-servico", "varanda", "quarto"], "analysis": "Descrição curta em português"}`;

    // 1. TENTAR CLAUDE (principal — melhor leitura de plantas)
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
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1024,
            messages: [{ role: "user", content: [
              { type: "image", source: { type: "base64", media_type: mimeType, data: base64 } },
              { type: "text", text: prompt }
            ]}]
          })
        });
        if (res.ok) {
          const result = await res.json();
          const text = result.content[0].text;
          const parsed = JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1));
          return NextResponse.json({ ...parsed, provider: 'claude' });
        }
      } catch (e) { console.error("Claude falhou..."); }
    }

    // 2. TENTAR GEMINI (Backup)
    if (geminiKey) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
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
          return NextResponse.json({ ...parsed, provider: 'gemini-2.5' });
        }
      } catch (e) { console.error("Gemini falhou..."); }
    }

    // 3. TENTAR OPENAI (Backup)
    if (openAiKey) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openAiKey}` },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } }
            ]}],
            response_format: { type: "json_object" }
          })
        });
        if (res.ok) {
          const result = await res.json();
          return NextResponse.json({ ...JSON.parse(result.choices[0].message.content), provider: 'openai' });
        }
      } catch (e) { console.error("OpenAI falhou..."); }
    }

    return NextResponse.json({
      rooms: ['suite-master', 'cozinha', 'sala-estar', 'banheiro'],
      analysis: 'Cotas esgotadas em todos os provedores. Selecione manualmente.',
      simulated: true
    });

  } catch (error) {
    return NextResponse.json({ error: 'Erro crítico' }, { status: 500 });
  }
}
