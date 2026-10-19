import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch("https://agribiz-nine.vercel.app/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });

  const cookieStore = await cookies();
  cookieStore.set("accessToken", data.accessToken || data.token || "", {
    httpOnly: true, secure: true, path: "/", maxAge: 86400,
  });
  if (data.refreshToken) {
    cookieStore.set("refreshToken", data.refreshToken, {
      httpOnly: true, secure: true, path: "/", maxAge: 604800,
    });
  }
  cookieStore.set("userName", data.user?.name || body.email.split("@")[0], { path: "/" });
  return NextResponse.json({ success: true });
}
