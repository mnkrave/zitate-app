import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await context.params;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        quotes: {
          include: {
            author: { select: { id: true, name: true, image: true } },
            submitter: { select: { id: true, name: true } },
            upvotes: true,
          },
          orderBy: { upvotes: { _count: "desc" } }
        }
      }
    });

    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
