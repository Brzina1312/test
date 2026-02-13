import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { userProfile } = await req.json();

    const bmr = userProfile.gender === 'male'
      ? 88.362 + (13.397 * userProfile.weight) + (4.799 * userProfile.height) - (5.677 * userProfile.age)
      : 447.593 + (9.247 * userProfile.weight) + (3.098 * userProfile.height) - (4.330 * userProfile.age);

    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    let tdee = bmr * (activityMultipliers[userProfile.activityLevel] || 1.55);

    if (userProfile.fitnessGoal === 'lose_weight') {
      tdee -= 500;
    } else if (userProfile.fitnessGoal === 'gain_muscle') {
      tdee += 300;
    }

    const protein = userProfile.weight * 2;
    const fat = (tdee * 0.25) / 9;
    const carbs = (tdee - (protein * 4) - (fat * 9)) / 4;

    const prompt = `Generate a daily meal plan for a user with the following profile:

Age: ${userProfile.age}
Gender: ${userProfile.gender}
Weight: ${userProfile.weight}kg
Fitness Goal: ${userProfile.fitnessGoal}
Dietary Restrictions: ${userProfile.dietaryRestrictions.join(', ') || 'None'}

Target Daily Macros:
- Calories: ${Math.round(tdee)}
- Protein: ${Math.round(protein)}g
- Carbs: ${Math.round(carbs)}g
- Fat: ${Math.round(fat)}g

Create meals for breakfast, lunch, dinner, and 2 snacks. For each meal, include:
- Name
- Description
- Calories
- Protein (g)
- Carbs (g)
- Fat (g)
- List of ingredients
- Step-by-step instructions
- Prep time in minutes
- Number of servings

Return the response as a JSON object with this structure:
{
  "name": "Meal Plan Name",
  "description": "Brief description",
  "dailyCalories": ${Math.round(tdee)},
  "dailyProtein": ${Math.round(protein)},
  "dailyCarbs": ${Math.round(carbs)},
  "dailyFat": ${Math.round(fat)},
  "meals": {
    "breakfast": [meal object],
    "lunch": [meal object],
    "dinner": [meal object],
    "snacks": [2 meal objects]
  }
}

Each meal object should have:
{
  "name": "Meal Name",
  "description": "Description",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "ingredients": ["ingredient1", "ingredient2"],
  "instructions": ["step1", "step2"],
  "prepTime": number,
  "servings": number
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert nutritionist. Generate meal plans in valid JSON format only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const mealPlan = JSON.parse(completion.choices[0].message.content || '{}');

    return NextResponse.json(mealPlan);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate meal plan' },
      { status: 500 }
    );
  }
}
