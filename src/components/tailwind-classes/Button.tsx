import { MouseEventHandler } from "react";

export function Button({
    onClick,
    value,
    className,
}: {
    onClick: MouseEventHandler,
    value: JSX.Element | string,
    className?: String,
}) {
    const moreClassName = className ?? "";

    return <button
        className={`rounded-full
        bg-blue-800 hover:bg-blue-900 active:bg-blue-700 
        dark:bg-purple-700 dark:hover:bg-purple-900 dark:active:bg-purple-500
        text-white
        ${moreClassName}`}
        onClick={onClick}>
        {value}
    </button>
}