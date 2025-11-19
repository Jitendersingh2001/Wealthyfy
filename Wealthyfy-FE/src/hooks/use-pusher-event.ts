import { useEffect, useRef } from "react";
import { pusherService } from "@/services/pusher";

/**
 * Generic hook for listening to Pusher events
 * 
 * @param eventName - The name of the Pusher event to listen to
 * @param callback - Callback function that will be called when the event is received
 * @param options - Optional configuration object
 * @param options.once - If true, the callback will only be called once (default: false)
 * @param options.enabled - If false, the event listener will not be set up (default: true)
 * 
 * @example
 * ```tsx
 * usePusherEvent("session-completed", (data) => {
 *   console.log("Session completed:", data);
 *   if (data.status === "COMPLETED") {
 *     onNext();
 *   }
 * }, { once: true });
 * ```
 */
export function usePusherEvent<T = unknown>(
  eventName: string,
  callback: (data: T) => void,
  options: {
    once?: boolean;
    enabled?: boolean;
  } = {}
): void {
  const { once = false, enabled = true } = options;
  const hasTriggered = useRef(false);
  const callbackRef = useRef(callback);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Reset the "once" flag when callback changes (which typically means dependencies changed)
  useEffect(() => {
    if (once) {
      hasTriggered.current = false;
    }
  }, [callback, once]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const channel = pusherService.getChannel();

    if (!channel) {
      console.warn(`Pusher channel not available for event: ${eventName}`);
      return;
    }

    const handleEvent = (data: T) => {
      // If once is true and we've already triggered, don't call the callback
      if (once && hasTriggered.current) {
        return;
      }

      // Call the callback with the latest reference
      callbackRef.current(data);

      // Mark as triggered if once is true
      if (once) {
        hasTriggered.current = true;
      }
    };

    // Bind to the event
    channel.bind(eventName, handleEvent);

    // Cleanup: unbind the event listener
    return () => {
      channel.unbind(eventName, handleEvent);
    };
  }, [eventName, enabled, once]);
}

