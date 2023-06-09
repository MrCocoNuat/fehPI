import Link from "next/link";
import { Button } from "../tailwind-styled/sync/Button";
import { MouseEvent } from "react";

export function BackButton(){
    // for use in slugged pages, 
    // and interestingly pwd("host/menu/[slug]/.") == "host/menu"
    return <Link href="." >
        <Button onClick={() => {}} value={"<"}></Button>
    </Link>
}