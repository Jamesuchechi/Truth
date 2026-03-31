import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

const RESERVED_USERNAMES = [
  "admin",
  "support",
  "truth",
  "help",
  "official",
  "moderator",
  "system",
  "anonymous",
  "shadow",
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get("username")

  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 })
  }

  if (username.length < 3) {
    return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 })
  }

  if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
    return NextResponse.json({ available: false, reserved: true })
  }

  const existingUser = await prisma.user.findUnique({
    where: { username },
  })

  return NextResponse.json({ available: !existingUser })
}
