/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (string | PrecacheEntry)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();

interface PushData {
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
  badge?: string;
}

self.addEventListener("push", (event: PushEvent) => {
  const data = event.data?.json() as PushData | undefined;
  if (data) {
    const { title, body, icon, url } = data;
    const options: ExtendedNotificationOptions = {
      body,
      icon: icon || "/icons/icon-192x192.png",
      data: { url },
      badge: "/icons/icon-192x192.png",
      vibrate: [100, 50, 100],
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        if (clientList.length > 0) {
          let client = clientList[0];
          for (let i = 0; i < clientList.length; i++) {
            if (clientList[i].focused) {
              client = clientList[i];
            }
          }
          return client.focus();
        }
        return self.clients.openWindow(event.notification.data.url || "/");
      })
  );
});
