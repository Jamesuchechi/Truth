import { auth as proxy } from "@/auth"

export default proxy

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
