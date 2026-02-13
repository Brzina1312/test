import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { userProfile } = await req.json();

    const prompt = `Generate a personalized workout plan for a user with the following profile:
    
Age: ${userProfile.age}
Gender: ${userProfile.gender}
Height: ${userProfile.height}cm
Weight: ${userProfile.weight}kg
Fitness Goal: ${userProfile.fitnessGoal}
Activity Level: ${userProfile.activityLevel}
Target Weight: ${userProfile.targetWeight || 'Not specified'}

Create a comprehensive workout plan with 3-5 exercises. For each exercise, include:
- Name
- Description
- Target muscles
- Equipment needed
- Difficulty level (beginner/intermediate/advanced)
- Sets and reps
- Rest time between sets
- Step-by-step instructions

Return the response as a JSON object with this structure:
{
  "name": "Workout Plan Name",
  "description": "Brief description of the plan",
  "frequency": number of days per week,
  "duration": minutes per session,
  "exercises": [
    {
      "name": "Exercise Name",
      "description": "Brief description",
      "targetMuscles": ["muscle1", "muscle2"],
      "equipment": "equipment needed",
      "difficulty": "beginner/intermediate/advanced",
      "sets": number,
      "reps": "rep range",
      "restTime": seconds,
      "instructions": ["step1", "step2", "step3"]
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert personal trainer. Generate workout plans in valid JSON format only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const workoutPlan = JSON.parse(completion.choices[0].message.content || '{}');

    return NextResponse.json(workoutPlan);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate workout plan' },
      { status: 500 }
    );
  }
}
