"use client";

import {useEffect, useRef, useState} from "react";
import {useSearchParams} from "next/navigation";
import CallPopup from "@/components/CallPopup";
import {connectStringeeClient} from "@/utils/stringee";
import CallVideo from "@/components/CallVideo";

// utils/jwt.ts
import {jwtDecode} from "jwt-decode";

export function decodeJWT(token) {
    try {
        return jwtDecode(token); // Trả về object đã decode
    } catch (e) {
        console.error("Failed to decode JWT", e);
        return null;
    }
}


export default function CallComponent() {
    const searchParams = useSearchParams();
    const beToken = searchParams.get("beToken") || "";
    const callee = searchParams.get("toid") || "";

    const [token, setToken] = useState(null);
    const [client, setClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [incomingCaller, setIncomingCaller] = useState(null);
    const [currentCall, setCurrentCall] = useState(null);
    const [callStatus, setCallStatus] = useState("");

    const currentCallRef = useRef(null);
    const callerRef = useRef("");

    const [remoteStream, setRemoteStream] = useState(null);
    const [localStream, setLocalStream] = useState(null);


    useEffect(() => {
        if (beToken) {
            const payload = decodeJWT(beToken);
            if (payload?.sub) {
                callerRef.current = payload.username;
            }
        }
    }, [beToken]);

    useEffect(() => {
        if (beToken) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/stringee/create-token`, {
                method: "POST",
                headers: {Authorization: `Bearer ${beToken}`},
            })
                .then((res) => res.json())
                .then((data) => setToken(data.body.token))
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
            setRemoteStream(stream);
        });

        call.on("addlocalstream", (stream) => {
            setLocalStream(stream);
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
        if (!client || !isConnected || !callee.trim()) return;
        setCallStatus("Making call...");

        const call = new window.StringeeCall(
            client,
            callerRef.current,
            callee.trim(),
            true,
            {isPeerToPeer: true}
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
                <p className="text-sm text-gray-500">
                    Caller (from): <strong>{callerRef.current}</strong> <br/>
                    Callee (to): <strong>{callee}</strong>
                </p>
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

            {(incomingCaller || currentCall) && (
                <CallVideo localStream={localStream} remoteStream={remoteStream}/>
            )}
        </div>
    );
}
