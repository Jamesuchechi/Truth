import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

neonConfig.webSocketConstructor = ws

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

const CHANNELS = [
  { name: "General", slug: "general", description: "The central hub of TruthOS. Everything and anything.", color: "#FF3366" },
  { name: "Shadows", slug: "shadows", description: "Where the hidden personas reveal their deepest secrets.", color: "#8A2BE2" },
  { name: "Whispers", slug: "whispers", description: "Soft truths and quiet confessions.", color: "#00BFFF" },
  { name: "DeepTalk", slug: "deep-talk", description: "Profound philosophical discussions and existential dread.", color: "#20B2AA" },
  { name: "TheVoid", slug: "the-void", description: "Shout into the emptiness and see what echoes back.", color: "#1A1A1A" },
  { name: "CyberSec", slug: "cyber-sec", description: "Protocol discussions, encryption, and digital safety.", color: "#32CD32" },
  { name: "Philosophy", slug: "philosophy", description: "Seeking the truth behind the truth.", color: "#FFD700" },
  { name: "Anonymity", slug: "anonymity", description: "Refining the art of staying unseen.", color: "#708090" },
  { name: "Meta", slug: "meta", description: "Discussions about the TruthOS protocol itself.", color: "#FF4500" },
  { name: "Leaks", slug: "leaks", description: "Verified and unverified signal spills.", color: "#DC143C" },
]

async function main() {
  console.log("Starting protocol seeding...")
  
  for (const c of CHANNELS) {
    const channel = await prisma.channel.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        color: c.color,
        isDefault: true,
      }
    })
    console.log(`Synchronized channel: ${channel.name}`)
  }

  console.log("Protocol seeding complete.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
