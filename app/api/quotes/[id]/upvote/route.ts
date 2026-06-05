import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // @ts-ignore
    const userId = session.user.id;
    const { id: quoteId } = await context.params;

    // Check if upvote exists
    const existingUpvote = await prisma.upvote.findUnique({
      where: { userId_quoteId: { userId, quoteId } }
    });

    if (existingUpvote) {
      // Remove upvote (toggle)
      await prisma.upvote.delete({
        where: { id: existingUpvote.id }
      });
      return NextResponse.json({ message: "Upvote removed", upvoted: false }, { status: 200 });
    } else {
      // Add upvote
      await prisma.upvote.create({
        data: { userId, quoteId }
      });
      return NextResponse.json({ message: "Upvote added", upvoted: true }, { status: 201 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
