import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const action = formData.get("action") as string;

  if (action === "login") {
    // Create or find demo user
    const demoUser = await prisma.user.upsert({
      where: { email: "demo@example.com" },
      update: {},
      create: {
        email: "demo@example.com",
        name: "Demo User",
      },
    });

    (await cookies()).set("demo-user", demoUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return NextResponse.redirect(new URL("/buyers", request.url));
  }

  if (action === "logout") {
    (await cookies()).delete("demo-user");
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
