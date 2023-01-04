import { MouseEventHandler } from "react";

export function Button({
    onClick,
    value,
    className,
    padding,
}: {
    onClick: MouseEventHandler,
    value: JSX.Element | string,
    className?: String,
    padding?: { x: number, y: number }
}) {
    className = className ?? "";
    padding = padding ?? { x: 2, y: 2 };

    return <button
        className={`rounded-full
        bg-blue-800 hover:bg-blue-900 active:bg-blue-700 
        dark:bg-purple-700 dark:hover:bg-purple-900 dark:active:bg-purple-500
        text-white
        px-${padding.x} py-${padding.y}
        ${className}`}
        onClick={onClick}>
        {value}
    </button>
}