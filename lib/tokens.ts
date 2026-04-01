import { v4 as uuidv4 } from "uuid"
import { prisma } from "@/lib/db/prisma"

export async function generateVerificationToken(email: string) {
  const token = uuidv4()
  const expires = new Date(new Date().getTime() + 3600 * 1000)

  const existingToken = await prisma.verificationToken.findFirst({
    where: { identifier: email },
  })

  if (existingToken) {
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: existingToken.identifier,
          token: existingToken.token,
        }
      },
    })
  }

  const verificationToken = await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  })

  return verificationToken
}

export async function generatePasswordResetToken(email: string) {
  const token = uuidv4()
  const expires = new Date(new Date().getTime() + 3600 * 1000)

  const existingToken = await prisma.passwordResetToken.findFirst({
    where: { email },
  })

  if (existingToken) {
    await prisma.passwordResetToken.delete({
      where: { id: existingToken.id },
    })
  }

  const passwordResetToken = await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  })

  return passwordResetToken
}

export async function generateTwoFactorToken(email: string) {
  const token = Math.floor(100000 + Math.random() * 900000).toString()
  const expires = new Date(new Date().getTime() + 5 * 60 * 1000)

  const existingToken = await prisma.twoFactorToken.findFirst({
    where: { email },
  })

  if (existingToken) {
    await prisma.twoFactorToken.delete({
      where: { id: existingToken.id },
    })
  }

  const twoFactorToken = await prisma.twoFactorToken.create({
    data: {
      email,
      token,
      expires,
    },
  })

  return twoFactorToken
}
