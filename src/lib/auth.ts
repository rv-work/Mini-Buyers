import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

export async function getCurrentUser() {
  const cookieStore = cookies();
  const userCookie = (await cookieStore).get("demo-user");

  if (!userCookie?.value) {
    redirect("/");
  }

  const userId = userCookie.value;
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    redirect("/");
  }

  return user;
}

export async function requireAuth() {
  return getCurrentUser();
}
