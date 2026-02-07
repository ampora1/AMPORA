import { useEffect, useRef, useState } from "react";

export default function useOperatorSocket() {

  const wsRef = useRef(null);
  const connectedRef = useRef(false);

  const [liveData, setLiveData] = useState(null);

  useEffect(() => {

    if (connectedRef.current) return;

    const ws = new WebSocket(
      "wss://ampora.dev/ws/charging?role=operator"
    );

    wsRef.current = ws;
    connectedRef.current = true;

    ws.onopen = () => console.log("Operator WS connected");

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === "LIVE") {
        setLiveData(payload);
      }
    };

    ws.onclose = () => console.log("Operator WS closed");

    return () => {
      ws.close();
      connectedRef.current = false;
    };

  }, []);

  return liveData;
}
