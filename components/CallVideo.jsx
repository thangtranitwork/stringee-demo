// components/CallVideoBox.jsx
"use client";

import { useEffect } from "react";

export default function CallVideo() {
    useEffect(() => {
        const local = document.getElementById("localVideo");
        const remote = document.getElementById("remoteVideo");

        // Cleanup khi component bị unmount
        return () => {
            if (local) local.srcObject = null;
            if (remote) remote.srcObject = null;
        };
    }, []);

    return (
        <div className="grid grid-cols-2 gap-5 mt-5">
            <div>
                <h4 className="font-semibold mb-1">Local Video</h4>
                <video id="localVideo" autoPlay muted className="w-full border rounded" />
            </div>
            <div>
                <h4 className="font-semibold mb-1">Remote Video</h4>
                <video id="remoteVideo" autoPlay className="w-full border rounded" />
            </div>
        </div>
    );
}
