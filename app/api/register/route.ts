import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const emailLower = email.toLowerCase();
    let isWhitelisted = emailLower === "lukasreinle0@gmail.com";

    if (!isWhitelisted) {
      const whitelisted = await prisma.whitelistedEmail.findUnique({
        where: { email: emailLower }
      });
      if (whitelisted) {
        isWhitelisted = true;
      } else {
        const whitelistStr = process.env.WHITELISTED_EMAILS;
        if (whitelistStr) {
          const allowedEmails = whitelistStr.split(",").map(e => e.trim().toLowerCase());
          if (allowedEmails.includes(emailLower)) {
            await prisma.whitelistedEmail.create({ data: { email: emailLower } });
            isWhitelisted = true;
          }
        }
      }
    }

    if (!isWhitelisted) {
      return NextResponse.json({ error: "Zugriff verweigert: E-Mail ist nicht auf der Whitelist." }, { status: 403 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: emailLower } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isAdmin = emailLower === "lukasreinle0@gmail.com";
    const user = await prisma.user.create({
      data: {
        name,
        email: emailLower,
        password: hashedPassword,
        role: isAdmin ? "ADMIN" : "USER",
      }
    });

    return NextResponse.json({ message: "User registered successfully", user: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
