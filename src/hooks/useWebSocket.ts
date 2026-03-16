"use client";

import { useEffect, useRef, useState } from "react";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000";

export function useStockWebSocket(productId: string) {
  const [stock, setStock] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;

    function connect() {
      if (typeof window === "undefined" || !activeRef.current) return;

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "subscribe", productId }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "stock_update" && data.productId === productId) {
            setStock(data.stock);
          }
        } catch {
          // Ignore parse errors
        }
      };

      ws.onclose = () => {
        if (activeRef.current) {
          setTimeout(connect, 3000);
        }
      };
    }

    connect();
    return () => {
      activeRef.current = false;
      const ws = wsRef.current;
      wsRef.current = null;
      ws?.close();
    };
  }, [productId]);

  return stock;
}
