import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();

    const systemPrompt = `You are an expert AI fitness and nutrition coach. You provide personalized advice on workouts, meal planning, and healthy lifestyle habits. 
    
Context about the user:
${context ? JSON.stringify(context, null, 2) : 'No user context available'}

Your responses should be:
- Encouraging and motivating
- Based on scientific evidence
- Tailored to the user's fitness level and goals
- Safe and focused on long-term health
- Include specific, actionable advice

If asked about medical conditions, always recommend consulting with a healthcare professional.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return NextResponse.json({
      message: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
