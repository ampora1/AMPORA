import { useEffect, useRef, useState } from "react";

export default function useChargingSocket() {
  const wsRef = useRef(null);

  const [data, setData] = useState({
    current: 0,
    power: 0,
    energy: 0,
    charging: false,
  });

  const [connected, setConnected] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [billInfo, setBillInfo] = useState(null);
const userId = localStorage.getItem("userId");
  useEffect(() => {
    const WS_URL = `wss://ampora.dev/ws/charging?userId=${userId}`;
    wsRef.current = new WebSocket(WS_URL);

    wsRef.current.onopen = () => setConnected(true);

    wsRef.current.onmessage = (event) => {
      const payload = JSON.parse(event.data);

     
      if (payload.type === "SESSION_END") {
        console.log("Session ended", payload);
        setSessionEnded(true);
        setBillInfo({
          energy: payload.energy,
          bill: payload.bill,
        });
        return;
      }

     
      if (payload.type === "LIVE") {
        setData(payload);
      }
    };

    wsRef.current.onclose = () => setConnected(false);
    return () => wsRef.current?.close();
  }, []);

  return {
    data,
    connected,
    sessionEnded,
    billInfo,
    resetSession: () => {
      setSessionEnded(false);
      setBillInfo(null);
    },
  };
}
