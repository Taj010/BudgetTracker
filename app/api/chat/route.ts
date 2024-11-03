import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.GPT || '',
});

export async function POST(req: NextRequest) {
  try {
    const { messagesList, alldata } = await req.json();
    console.log(alldata);

    const messages = [
      {
        role: 'system',
        content: `You are a knowledgeable and supportive financial advisor. Your goal is to provide helpful recommendations and advice based on the user's financial history and current goals. Analyze transaction data, identify patterns in spending, and suggest actionable steps to help the user achieve better financial health. Be clear, concise, and encouraging.
        below is the users transaction history and all data, please your response will be fed into a text to speach model so be clear and concise. write it as if you are talking to the user. do not use * or any other special characters which you would use to format text.
        transactions: ${JSON.stringify(alldata)}
        `,
      },
      ...messagesList,
    ];

    const _response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      max_tokens: 100,
    });

    return NextResponse.json({
      message: _response.choices[0].message?.content || '',
    });
  } catch (error) {
    return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 });
  }
}
