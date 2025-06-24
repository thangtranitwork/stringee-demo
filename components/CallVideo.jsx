"use client"
import {useEffect, useRef, useState} from "react";

export default function CallVideo({ localStream, remoteStream }) {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const toggleMic = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMicOn(audioTrack.enabled);
            }
        }
    };

    const toggleCam = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsCamOn(videoTrack.enabled);
            }
        }
    };

    return (
        <div className="mt-5 space-y-4">
            <div className="flex gap-3">
                <button
                    onClick={toggleMic}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    {isMicOn ? "Tắt Micro" : "Bật Micro"}
                </button>
                <button
                    onClick={toggleCam}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    {isCamOn ? "Tắt Camera" : "Bật Camera"}
                </button>
            </div>

            <div className="grid grid-cols-2 gap-5">
                <div>
                    <h4 className="font-semibold mb-1">Local Video</h4>
                    <video ref={localVideoRef} autoPlay muted className="w-full border rounded" />
                </div>
                <div>
                    <h4 className="font-semibold mb-1">Remote Video</h4>
                    <video ref={remoteVideoRef} autoPlay className="w-full border rounded" />
                </div>
            </div>
        </div>
    );
}
