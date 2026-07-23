"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { over, Client } from "stompjs";
import SockJS from "sockjs-client";

interface WebSocketHookReturn {
  connect: () => void;
  disconnect: () => void;
  sendMessage: (destination: string, body: any) => void;
  isConnected: boolean;
  error: any;
}

/**
 * A custom hook to manage WebSocket connections with SockJS and Stomp.
 *
 * Verified against the backend (h-phsar-api-full): the only destination it
 * ever publishes to is `/topic/notifications/{buyerId}` (SupplierOrderServiceImpl),
 * with a literal string body, not JSON — there is no supplier- or admin-facing
 * topic. Do not subscribe suppliers/admins to a topic keyed by their own
 * userId; it will never receive anything.
 *
 * @param {string | null} topic - The WebSocket topic to subscribe to.
 * @param {function} onMessage - Callback for when a message is received.
 * @param {boolean} connectOnMount - Whether to connect when the component mounts.
 */
export default function useWebSocket(
  topic: string | null,
  onMessage?: (payload: any) => void,
  connectOnMount: boolean = true,
): WebSocketHookReturn {
  const stompClient = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<any>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const connectionActive = useRef(false);

  const disconnect = useCallback(() => {
    connectionActive.current = false;
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    if (stompClient.current) {
      try {
        stompClient.current.disconnect(() => {});
      } catch (e) {
        // Already disconnected or failed to disconnect
      }
      stompClient.current = null;
    }
    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    // Prevent multiple connection attempts
    if (stompClient.current?.connected || !topic) return;

    connectionActive.current = true;
    const socketUrl = `${process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080"}/ws`;

    try {
      const socket = new SockJS(socketUrl);
      const client = over(socket);
      stompClient.current = client;

      // Disable debug logging in production
      if (process.env.NODE_ENV === "production") {
        client.debug = () => {};
      }

      client.connect(
        {},
        () => {
          // Bail out if this client has been replaced or intentionally disconnected
          if (!connectionActive.current || stompClient.current !== client) {
            try { client.disconnect(() => {}); } catch (_) {}
            return;
          }

          setIsConnected(true);
          setError(null);

          if (topic) {
            client.subscribe(topic, (payload) => {
              if (!onMessage) return;
              // The backend sends a plain string body (e.g. "NEW_NOTIFICATION"),
              // not JSON — only fall back to the raw string, never throw.
              try {
                onMessage(JSON.parse(payload.body));
              } catch {
                onMessage(payload.body);
              }
            });
          }
        },
        (err) => {
          // Ignore errors from stale clients
          if (stompClient.current !== client) return;

          setIsConnected(false);
          setError(err);

          // Only attempt reconnect if the connection was supposed to be active
          if (connectionActive.current) {
            console.warn("WebSocket connection lost. Reconnecting in 5s...");
            reconnectTimeout.current = setTimeout(connect, 5000);
          }
        },
      );
    } catch (e) {
      setError(e);
      if (connectionActive.current) {
        reconnectTimeout.current = setTimeout(connect, 5000);
      }
    }
  }, [topic, onMessage, disconnect]);

  const sendMessage = useCallback((destination: string, body: any) => {
    if (stompClient.current?.connected) {
      stompClient.current.send(destination, {}, JSON.stringify(body));
    } else {
      console.warn("Cannot send message: WebSocket not connected");
    }
  }, []);

  useEffect(() => {
    if (connectOnMount && topic) {
      connect();
    }
    return () => disconnect();
  }, [connect, disconnect, connectOnMount, topic]);

  return { connect, disconnect, sendMessage, isConnected, error };
}
