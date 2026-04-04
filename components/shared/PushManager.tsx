"use client";

import {
  useEffect,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { subscribeUser, unsubscribeUser } from "@/lib/actions/push";
import { useToast } from "@/components/providers/ToastProvider";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export interface PushManagerHandle {
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  isSubscribed: boolean;
  isLoading: boolean;
}

export const PushManager = forwardRef<
  PushManagerHandle,
  { onStatusChange?: (status: boolean) => void }
>(({ onStatusChange }, ref) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [swRegistration, setSwRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then((registration) => {
        setSwRegistration(registration);
        registration.pushManager.getSubscription().then((subscription) => {
          const subscribed = !!subscription;
          setIsSubscribed(subscribed);
          setIsLoading(false);
          onStatusChange?.(subscribed);
        });
      });
    } else {
      setIsLoading(false);
    }
  }, [onStatusChange]);

  const subscribe = useCallback(async () => {
    if (!swRegistration) return;

    try {
      setIsLoading(true);
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        showToast("VAPID_PUBLIC_KEY_MISSING", "error");
        return;
      }

      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const subJSON = JSON.parse(JSON.stringify(subscription));
      const res = await subscribeUser(subJSON);

      if (res.success) {
        setIsSubscribed(true);
        onStatusChange?.(true);
        showToast("PUSH_NOTIFICATIONS_ENABLED", "success");
      } else {
        showToast("PUSH_SUBSCRIPTION_FAILED", "error");
      }
    } catch (error) {
      console.error("Push subscription error:", error);
      showToast("PERMISSION_DENIED_OR_FAILURE", "error");
    } finally {
      setIsLoading(false);
    }
  }, [swRegistration, showToast, onStatusChange]);

  const unsubscribe = useCallback(async () => {
    if (!swRegistration) return;

    try {
      setIsLoading(true);
      const subscription = await swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await unsubscribeUser(subscription.endpoint);
        setIsSubscribed(false);
        onStatusChange?.(false);
        showToast("PUSH_NOTIFICATIONS_DISABLED", "info");
      }
    } catch (error) {
      console.error("Push unsubscription error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [swRegistration, showToast, onStatusChange]);

  useImperativeHandle(ref, () => ({
    subscribe,
    unsubscribe,
    isSubscribed,
    isLoading,
  }));

  return null;
});

PushManager.displayName = "PushManager";
