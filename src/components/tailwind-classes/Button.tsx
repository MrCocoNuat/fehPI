import { MouseEventHandler } from "react";

export function Button({
    onClick,
    value
}: {
    onClick: MouseEventHandler,
    value: JSX.Element | string,
}) {
    return <button
        className="rounded-full
        bg-yellow-300 hover:bg-yellow-100 active:bg-yellow-500 
        dark:bg-purple-700 dark:hover:bg-purple-900 dark:active:bg-purple-500
        p-2 m-2"
        onClick={onClick}>
        {value}
    </button>
}