"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import type { PushSubscription } from "web-push";

export async function subscribeUser(subscription: PushSubscription) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const endpoint = subscription.endpoint;
    const keys = subscription.keys;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      throw new Error("Invalid subscription object structure");
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: {
        userId: session.user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      update: {
        userId: session.user.id,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to subscribe user:", error);
    return { error: "Failed to save subscription" };
  }
}

export async function unsubscribeUser(endpoint: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await prisma.pushSubscription.delete({
      where: { endpoint },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to unsubscribe user:", error);
    return { error: "Failed to remove subscription" };
  }
}
