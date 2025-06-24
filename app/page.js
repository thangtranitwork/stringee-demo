import {Suspense} from "react";
import CallComponent from "@/components/CallComponent";

export default function Home() {
    return (
        <Suspense fallback={<div>Đang tải...</div>}>
            <CallComponent/>
        </Suspense>
    );
}
