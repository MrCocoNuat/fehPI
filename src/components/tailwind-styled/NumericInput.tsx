import { ChangeEventHandler } from "react";

const defaultCss = "rounded-md m-1 px-1 ring-1 ring-neutral-500 dark:bg-inherit";

export function NumericInput({
    id,
    value,
    onChange,
    minMax,
    className,
}: {
    id: string,
    value: number,
    onChange: ChangeEventHandler<HTMLInputElement>,
    minMax?: { min?: number, max?: number },
    className?: string,
}) {
    return <input
        id={id}
        className={`${className} ${defaultCss}`}
        type="number"
        value={value}
        min={minMax?.min}
        max={minMax?.max}
        onChange={onChange}></input>
}