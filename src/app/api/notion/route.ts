import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

export async function POST(req: NextRequest) {
  try {
    const { briefingData, aiAnalysis } = await req.json();

    const notion = new Client({ auth: process.env.NOTION_TOKEN });
    const databaseId = process.env.NOTION_DATABASE_ID;

    if (!databaseId) throw new Error('Notion Database ID missing');

    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        'Nome': { title: [{ text: { content: briefingData.client_name } }] },
        'Data': { date: { start: new Date().toISOString().split('T')[0] } },
        'Arquétipo': { select: { name: aiAnalysis.archetype.name } },
        'Score Complexidade': { number: aiAnalysis.complexity.score },
        'Status': { status: { name: 'Briefing Concluído' } },
        'Diretrizes': { rich_text: [{ text: { content: aiAnalysis.concept.join(' | ') } }] },
        'Orçamento': { rich_text: [{ text: { content: briefingData.answers.investment } }] }
      },
      children: [
        {
          object: 'block',
          type: 'heading_2',
          heading_2: { rich_text: [{ text: { content: 'Resumo da Análise IA' } }] }
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: { rich_text: [{ text: { content: aiAnalysis.narrative } }] }
        },
        {
          object: 'block',
          type: 'heading_3',
          heading_3: { rich_text: [{ text: { content: 'Próximos Passos (Dúvidas em aberto)' } }] }
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: { rich_text: aiAnalysis.openQuestions.map((q: string) => ({ text: { content: q } })) }
        }
      ]
    });

    return NextResponse.json({ success: true, url: (response as any).url });

  } catch (error: any) {
    console.error('Notion Integration Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
