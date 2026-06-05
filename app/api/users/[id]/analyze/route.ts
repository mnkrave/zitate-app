import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { quotes: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.quotes.length === 0) {
      return NextResponse.json({ error: "Not enough quotes to analyze" }, { status: 400 });
    }

    const quotesText = user.quotes.map(q => `"${q.text}"`).join("\n");

    const prompt = `Analysiere die folgenden Zitate von der Person "${user.name}". 
Erstelle ein kurzes, humorvolles "Charakter-Profil" basierend auf den Wörtern und dem Inhalt. 
Bewerte die Art des Humors (z.B. wissenschaftlich, schwarzer Humor, albern, zynisch) und fasse die Persönlichkeit in 3-4 Sätzen zusammen.

Zitate:
${quotesText}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const aiProfile = response.text;

    // Save to user
    await prisma.user.update({
      where: { id: userId },
      data: { aiProfile }
    });

    return NextResponse.json({ message: "Analysis complete", aiProfile }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
