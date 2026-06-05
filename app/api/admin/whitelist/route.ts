import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Resend } from "resend";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.email !== "lukasreinle0@gmail.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const whitelist = await prisma.whitelistedEmail.findMany({
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(whitelist);
  } catch (error) {
    console.error("Fetch whitelist failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.email !== "lukasreinle0@gmail.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }
    const emailLower = email.toLowerCase().trim();

    // Check if already whitelisted
    const existing = await prisma.whitelistedEmail.findUnique({
      where: { email: emailLower }
    });

    if (existing) {
      return NextResponse.json({ error: "E-Mail ist bereits freigeschaltet." }, { status: 400 });
    }

    // Add to database
    const whitelisted = await prisma.whitelistedEmail.create({
      data: { email: emailLower }
    });

    // Generate register link
    const baseUrl = process.env.NEXTAUTH_URL || "https://zitate-app.vercel.app";
    const registerLink = `${baseUrl}/register?email=${encodeURIComponent(emailLower)}`;

    let emailSent = false;
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "Zitate App <onboarding@resend.dev>",
          to: emailLower,
          subject: "Du wurdest zur Zitate-App eingeladen!",
          html: `
            <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #12131a; color: #ffffff; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
              <h2 style="color: #5b21b6; margin-bottom: 20px;">Hallo!</h2>
              <p style="font-size: 16px; line-height: 1.6;">Du wurdest eingeladen, der Zitate-App beizutreten, um Zitate aufzuschreiben und abzustimmen!</p>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">Klicke auf den Button unten, um dich zu registrieren:</p>
              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${registerLink}" style="background-color: #7c3aed; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(124, 58, 237, 0.25);">Registrieren</a>
              </div>
              <p style="font-size: 12px; color: #9ca3af; line-height: 1.6;">Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br><a href="${registerLink}" style="color: #a78bfa; text-decoration: underline;">${registerLink}</a></p>
            </div>
          `
        });
        emailSent = true;
      } catch (err) {
        console.error("Email sending failed:", err);
      }
    }

    return NextResponse.json({
      message: "E-Mail erfolgreich freigeschaltet.",
      whitelisted,
      inviteLink: registerLink,
      emailSent
    }, { status: 201 });
  } catch (error) {
    console.error("Add to whitelist failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.email !== "lukasreinle0@gmail.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Missing email parameter" }, { status: 400 });
    }
    const emailLower = email.toLowerCase().trim();

    if (emailLower === "lukasreinle0@gmail.com") {
      return NextResponse.json({ error: "Super Admin kann nicht gelöscht werden." }, { status: 400 });
    }

    await prisma.whitelistedEmail.delete({
      where: { email: emailLower }
    });

    return NextResponse.json({ message: "E-Mail erfolgreich von der Whitelist gelöscht." });
  } catch (error) {
    console.error("Remove from whitelist failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
