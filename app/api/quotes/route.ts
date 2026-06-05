import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import convert from "heic-convert";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // @ts-ignore
    const submitterId = session.user.id;

    const formData = await req.formData();
    const text = formData.get("text") as string;
    const authorId = formData.get("authorId") as string;
    const dateStr = formData.get("date") as string;
    const file = formData.get("image") as File | null;

    if (!text || !authorId) {
      return NextResponse.json({ error: "Missing text or authorId" }, { status: 400 });
    }

    let imageUrl = null;
    if (file && file.size > 0) {
      let buffer = Buffer.from(await file.arrayBuffer());
      const filename = file.name.toLowerCase();
      const isHeic = filename.endsWith(".heic") || filename.endsWith(".heif") || file.type === "image/heic" || file.type === "image/heif";
      let mimeType = file.type;

      if (isHeic) {
        try {
          const outputBuffer = await convert({
            buffer: buffer,
            format: "JPEG",
            quality: 0.8
          });
          buffer = Buffer.from(outputBuffer);
          mimeType = "image/jpeg";
        } catch (convertError) {
          console.error("HEIC conversion failed:", convertError);
        }
      }

      const base64Data = buffer.toString("base64");
      imageUrl = `data:${mimeType};base64,${base64Data}`;
    }

    const date = dateStr ? new Date(dateStr) : new Date();

    const quote = await prisma.quote.create({
      data: {
        text,
        authorId,
        submitterId,
        date,
        imageUrl,
      }
    });

    return NextResponse.json({ message: "Quote created", quote }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const quotes = await prisma.quote.findMany({
      include: {
        author: { select: { id: true, name: true, image: true } },
        submitter: { select: { id: true, name: true } },
        upvotes: true,
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(quotes);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
