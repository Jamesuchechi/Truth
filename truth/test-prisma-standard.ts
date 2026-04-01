import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  console.log('Testing connection standard...')
  try {
    const user = await prisma.user.findFirst()
    console.log('Connected! Found user:', user?.email)
  } catch (e) {
    console.error('Connection failed:', e)
  }
}
main()
