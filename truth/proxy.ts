import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const pathname = nextUrl.pathname

  // Handle @username -> /username rewrite
  if (pathname.startsWith("/@")) {
    const username = pathname.substring(2)
    if (username) {
      return NextResponse.rewrite(new URL(`/${username}`, nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
