"use client";

import { useEffect, useState, useRef } from "react";
import CallPopup from "@/components/CallPopup";
import { connectStringeeClient } from "@/utils/stringee";

function decodeJWT(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch (e) {
    console.error("Failed to decode JWT", e);
    return null;
  }
}

export default function CallPage() {
  const [incomingCaller, setIncomingCaller] = useState(null);
  const [token, setToken] = useState(null);
  const [beToken, setBeToken] = useState("<BE_TOKEN_HERE>");
  const [client, setClient] = useState(null);
  const [userId, setUserId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [currentCall, setCurrentCall] = useState(null);
  const [callStatus, setCallStatus] = useState("");
  const currentCallRef = useRef(null);
  const myIdRef = useRef("");

  useEffect(() => {
    if (beToken) {
      const payload = decodeJWT(beToken);
      if (payload?.sub) {
        myIdRef.current = payload.sub;
      }
    }
  }, [beToken]);

  useEffect(() => {
    if (beToken) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/call/create-token`, {
        method: "POST",
        headers: { Authorization: `Bearer ${beToken}` },
      })
        .then((res) => res.json())
        .then((data) => setToken(data.token))
        .catch((err) => {
          console.error("Error getting token:", err);
          setCallStatus("Error getting token");
        });
    }
  }, [beToken]);

  useEffect(() => {
    if (token && typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "/libs/latest.sdk.bundle.min.js";
      script.onload = () => {
        const c = connectStringeeClient(
          token,
          (incomingCall) => {            
            currentCallRef.current = incomingCall;
            setIncomingCaller({
              name: incomingCall.fromAlias || incomingCall.fromNumber,
            });
          },
          (connected) => {
            setIsConnected(connected);
            setCallStatus(connected ? "Connected to Stringee" : "Disconnected");
          }
        );
        setClient(c);
      };
      document.body.appendChild(script);
    }
  }, [token]);

  const handleAccept = () => {
    const call = currentCallRef.current;
    call.answer(() => {
      setIncomingCaller(null);
      setCurrentCall(call);
      setCallStatus("In call");
    });
    setupCallEvents(call);
  };

  const handleReject = () => {
    const call = currentCallRef.current;
    call.reject(() => setIncomingCaller(null));
  };

  const setupCallEvents = (call) => {
    call.on("addremotestream", (stream) => {
      const remoteVideo = document.getElementById("remoteVideo");
      if (remoteVideo) remoteVideo.srcObject = stream;
    });

    call.on("addlocalstream", (stream) => {
      const localVideo = document.getElementById("localVideo");
      if (localVideo) localVideo.srcObject = stream;
    });

    call.on("signalingstate", (state) => {
      setCallStatus(`Call state: ${state.reason}`);
    });

    call.on("mediastate", (state) => {
      console.log("Media state:", state);
    });

    call.on("info", (info) => {
      console.log("Call info:", info);
    });
  };

  const makeCall = () => {
    if (!client || !isConnected || !userId.trim()) return;
    setCallStatus("Making call...");

    const call = new window.StringeeCall(
      client,
      myIdRef.current,
      userId.trim(),
      true,
      { isPeerToPeer: true }
    );

    call.makeCall((res) => {
      if (res.r === 0) {
        setCurrentCall(call);
        setCallStatus("Calling...");
        currentCallRef.current = call;
        setupCallEvents(call);
      } else {
        console.error("Call failed:", res);
        setCallStatus(`Gọi thất bại: ${res.message || 'Không xác định'}`);
      }
    });
  };

  const endCall = () => {
    if (currentCall) {
      currentCall.hangup(() => {
        setCurrentCall(null);
        setCallStatus("Call ended");
        const local = document.getElementById("localVideo");
        const remote = document.getElementById("remoteVideo");
        if (local) local.srcObject = null;
        if (remote) remote.srcObject = null;
      });
    }
  };

  return (
    <div className="p-5 space-y-5">
      <h1 className="text-2xl font-bold">📞 Stringee Call Demo</h1>

      <div className="p-4 border rounded space-y-3">
        <div>
          <label className="block font-medium">BE Token:</label>
          <input
            type="text"
            value={beToken}
            onChange={(e) => setBeToken(e.target.value)}
            className="w-full mt-1 px-3 py-2 text-sm font-mono border rounded"
            placeholder="Nhập BE Token"
          />
          <p className="text-sm text-gray-500 mt-1">
            User ID gọi: <span className="font-semibold text-blue-700">{myIdRef.current}</span>
          </p>
        </div>

        <div>
          <label className="block font-medium">User ID người nhận:</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded"
            placeholder="User ID muốn gọi"
          />
        </div>

        <div>
          <span className="font-semibold">Trạng thái:</span>
          <span
            className={`ml-2 font-bold ${
              isConnected ? "text-green-600" : "text-red-600"
            }`}
          >
            {callStatus || "Chưa kết nối"}
          </span>
        </div>
      </div>

      <div className="space-x-3">
        <button
          onClick={makeCall}
          disabled={!isConnected || currentCall}
          className={`px-4 py-2 text-white rounded ${
            !isConnected || currentCall
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Gọi
        </button>
        {currentCall && (
          <button
            onClick={endCall}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Kết thúc
          </button>
        )}
      </div>

      {incomingCaller && (
        <CallPopup
          caller={incomingCaller}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      )}

      <div className="grid grid-cols-2 gap-5">
        <div>
          <h4 className="font-semibold mb-1">Local Video</h4>
          <video id="localVideo" autoPlay muted className="w-full border rounded" />
        </div>
        <div>
          <h4 className="font-semibold mb-1">Remote Video</h4>
          <video id="remoteVideo" autoPlay className="w-full border rounded" />
        </div>
      </div>
    </div>
  );
}