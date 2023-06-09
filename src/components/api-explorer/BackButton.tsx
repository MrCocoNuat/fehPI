import Link from "next/link";
import { Button } from "../tailwind-styled/sync/Button";
import { MouseEvent } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

export function SlugBackButton() {
    // for use in slugged pages, 
    // interestingly pwd("host/menu/[slug]/.") == "host/menu"
    return <div>
        <Link href="." className="p-2">
            <Button onClick={() => { }} className="bg-blue-500/25" value={
                <div className="p-2">
                    <ArrowLeftIcon className="w-6 h-6 text-black dark:text-white" />
                </div>
            } />
        </Link>
    </div>
}