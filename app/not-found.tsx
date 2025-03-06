import { Button } from "@/components/ui/button";
import Link from "next/link";

// pages/404.tsx
export default function Custom404() {
    return (
        <>
            <div className="flex flex-col gap-4 justify-center items-center">
                <h1 className="text-4xl">404</h1>
                <h2 className="text-2xl">Page Not Found</h2>
                <Link href="/"><Button>Back to Home</Button></Link>
            </div>
        </>
    )
}