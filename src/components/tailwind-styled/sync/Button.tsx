import { MouseEventHandler } from "react";
import { flushSync } from "react-dom";

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
    const fullClassName = `rounded-full
        bg-blue-800 hover:bg-blue-900 active:bg-blue-700 
        text-white
        ${moreClassName}`

    return <button
        className={fullClassName}
        onClick={onClick}>
        {value}
    </button>
}