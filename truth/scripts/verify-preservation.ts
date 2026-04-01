import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Starting Preservation Verification...");

  // 1. Create a guest user
  const guestUsername = `guest_${Math.random().toString(36).substring(2, 8)}`;
  const guest = await prisma.user.create({
    data: {
      username: guestUsername,
      isAnonymous: true,
      anonymousId: `anon_${Math.random().toString(36).substring(2, 12)}`,
      shadowName: `shadow_${Math.random().toString(36).substring(2, 7)}`,
    }
  });
  console.log(`✅ Created Guest User: ${guest.username} (ID: ${guest.id})`);

  // 2. Create a post for this guest
  const post = await prisma.post.create({
    data: {
      content: "This is a secret truth from a ghost.",
      authorId: guest.id,
    }
  });
  console.log(`✅ Created Post for Guest (Post ID: ${post.id})`);

  // 3. Create a message received by this guest
  const msgReceived = await prisma.message.create({
    data: {
      content: "Hello ghost!",
      receiverId: guest.id,
      senderName: "Stranger"
    }
  });
  console.log(`✅ Created Received Message for Guest (Msg ID: ${msgReceived.id})`);

  // 4. Create a message sent BY this guest (using the new senderId field)
  const msgSent = await prisma.message.create({
    data: {
      content: "I am becoming real soon.",
      receiverId: guest.id, // sending to self for test
      senderId: guest.id,
      senderName: guest.username
    }
  });
  console.log(`✅ Created Sent Message for Guest (Msg ID: ${msgSent.id})`);

  // 5. CONVERT GUEST -> REGISTERED
  console.log("🔄 Converting Guest to Registered User...");
  const registeredEmail = `real_${Math.random().toString(36).substring(2, 8)}@example.com`;
  const updatedUser = await prisma.user.update({
    where: { id: guest.id },
    data: {
      username: "RealHuman",
      email: registeredEmail,
      isAnonymous: false,
      passwordHash: "hashed_password_placeholder"
    }
  });
  console.log(`✅ Conversion Complete: ${updatedUser.username} (${updatedUser.email})`);

  // 6. VERIFY PRESERVATION
  console.log("🔍 Verifying Data Preservation...");

  const userWithData = await prisma.user.findUnique({
    where: { id: guest.id },
    include: {
      posts: true,
      receivedMessages: true,
      sentMessages: true,
    }
  });

  if (!userWithData) throw new Error("User not found after conversion!");

  const postPreserved = userWithData.posts.some(p => p.id === post.id);
  const msgReceivedPreserved = userWithData.receivedMessages.some(m => m.id === msgReceived.id);
  const msgSentPreserved = userWithData.sentMessages.some(m => m.id === msgSent.id);

  console.log(`📊 Results:`);
  console.log(`   - Posts Preserved: ${postPreserved ? "YES" : "NO"}`);
  console.log(`   - Received Messages Preserved: ${msgReceivedPreserved ? "YES" : "NO"}`);
  console.log(`   - Sent Messages (senderId) Preserved: ${msgSentPreserved ? "YES" : "NO"}`);

  if (postPreserved && msgReceivedPreserved && msgSentPreserved) {
    console.log("\n🎊 VERIFICATION SUCCESSFUL: All anonymous data preserved!");
  } else {
    console.log("\n❌ VERIFICATION FAILED: Some data was lost during conversion.");
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
