import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, userProfile, conversationHistory } = await request.json();

    const systemPrompt = `You are an expert AI fitness and nutrition coach. Your role is to:
- Provide personalized fitness and nutrition advice
- Answer questions about workouts, exercises, and training
- Offer meal planning and nutritional guidance
- Give motivation and encouragement
- Help users achieve their fitness goals safely and effectively

User Profile:
${userProfile?.goals ? `Goals: ${userProfile.goals.join(", ")}` : ""}
${userProfile?.fitnessLevel ? `Fitness Level: ${userProfile.fitnessLevel}` : ""}
${userProfile?.dietaryPreferences ? `Dietary Preferences: ${userProfile.dietaryPreferences.join(", ")}` : ""}

Keep responses friendly, encouraging, and actionable. Focus on evidence-based advice.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseMessage = completion.choices[0].message.content;

    return NextResponse.json({ message: responseMessage });
  } catch (error) {
    console.error("Error in chat:", error);
    return NextResponse.json(
      { error: "Failed to get response from AI coach" },
      { status: 500 }
    );
  }
}
