import { prisma } from './lib/db/prisma'
async function main() {
  console.log('Testing connection...')
  try {
    const user = await prisma.user.findFirst()
    console.log('Connected! Found user:', user?.email)
  } catch (e) {
    console.error('Connection failed:', e)
  }
}
main()
