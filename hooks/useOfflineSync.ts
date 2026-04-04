"use client";

import { useEffect, useState, useCallback } from "react";
import { db } from "@/lib/db/offline";
import { useToast } from "@/components/providers/ToastProvider";

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const { showToast } = useToast();

  const syncPendingActions = useCallback(async () => {
    const pending = await db.pendingActions.toArray();
    if (pending.length === 0) return;

    showToast(`SYNCHRONIZING_${pending.length}_PENDING_SIGNALS...`, "info");

    // Process actions sequentially
    for (const action of pending) {
      try {
        // This is a placeholder for actual synchronization logic
        // In a real implementation, we would match action.type to a server action
        console.warn("Syncing offline action:", action);

        // Simulating sync delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        await db.pendingActions.delete(action.id);
      } catch (error) {
        console.error("Failed to sync action:", action.id, error);
      }
    }

    showToast("ALL_SIGNALS_SYNCHRONIZED", "success");
  }, [showToast]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingActions();
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast("SIGNAL_LOST: OFFLINE_MODE_ENABLED", "error");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    if (navigator.onLine) {
      syncPendingActions();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncPendingActions, showToast]);

  return { isOnline, syncPendingActions };
}
