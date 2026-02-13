import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getFirestore } from "firebase-admin/firestore";
import { initAdmin } from "@/lib/firebase/admin";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { dietaryPreferences, goals, userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    initAdmin();
    const db = getFirestore();

    const prompt = `Create a personalized daily meal plan for someone with:
    
Dietary Preferences: ${dietaryPreferences?.join(", ")}
Goals: ${goals?.join(", ")}

Generate a complete day of meals (breakfast, lunch, dinner) with proper macros. For each meal:
- Meal name
- Time suggestion
- Calories
- Protein (grams)
- Carbs (grams)
- Fats (grams)
- List of ingredients
- Brief cooking instructions

Respond in JSON format:
{
  "date": "today's date",
  "totalCalories": total,
  "meals": {
    "breakfast": {
      "name": "meal name",
      "time": "7:00 AM",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fats": number,
      "ingredients": ["item 1", "item 2"],
      "instructions": "cooking steps"
    },
    "lunch": {...},
    "dinner": {...}
  }
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert nutritionist who creates balanced, delicious meal plans tailored to dietary needs and fitness goals.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const mealPlan = JSON.parse(completion.choices[0].message.content || "{}");

    await db.collection("mealPlans").add({
      userId,
      ...mealPlan,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(mealPlan);
  } catch (error) {
    console.error("Error generating meals:", error);
    return NextResponse.json(
      { error: "Failed to generate meal plan" },
      { status: 500 }
    );
  }
}
