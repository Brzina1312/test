import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getFirestore } from "firebase-admin/firestore";
import { initAdmin } from "@/lib/firebase/admin";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { goals, fitnessLevel, userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    initAdmin();
    const db = getFirestore();

    const prompt = `Create a personalized workout plan for someone with the following profile:
    
Goals: ${goals?.join(", ")}
Fitness Level: ${fitnessLevel}

Generate a workout plan with 5-7 exercises. For each exercise, provide:
- Exercise name
- Number of sets (3-4)
- Reps or duration
- Rest period in seconds
- Brief form notes

Respond in JSON format:
{
  "name": "Workout Plan Name",
  "duration": "estimated duration",
  "difficulty": "beginner/intermediate/advanced",
  "exercises": [
    {
      "name": "Exercise name",
      "sets": number,
      "reps": "number or duration",
      "rest": "seconds",
      "notes": "form tips"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert personal trainer who creates safe, effective workout plans tailored to individual needs.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const workoutPlan = JSON.parse(completion.choices[0].message.content || "{}");

    await db.collection("workoutPlans").add({
      userId,
      ...workoutPlan,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(workoutPlan);
  } catch (error) {
    console.error("Error generating workout:", error);
    return NextResponse.json(
      { error: "Failed to generate workout plan" },
      { status: 500 }
    );
  }
}
