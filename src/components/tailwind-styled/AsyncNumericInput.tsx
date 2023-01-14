// Just as AsyncSelects let you asynchronously load its options,
// AsyncNumericInput lets you asynchronously load min and max, which are like options for NumericInput

import { ChangeEventHandler, useEffect, useRef, useState } from "react";
import { NumericInput } from "./NumericInput";

function isAsync(possiblyAsyncEventHandler: ChangeEventHandler<HTMLInputElement> | Promise<ChangeEventHandler<HTMLInputElement>>)
    : possiblyAsyncEventHandler is Promise<ChangeEventHandler<HTMLInputElement>> {
    return (possiblyAsyncEventHandler as ChangeEventHandler<HTMLInputElement>).apply === undefined;
}

export function AsyncNumericInput(
    {
        id,
        value,
        onChange,
        loadMinMax,
        className,
    }: {
        id: string,
        value: number,
        onChange: ChangeEventHandler<HTMLInputElement>,
        loadMinMax: () => Promise<{ min?: number, max?: number }>,
        className?: string,
    }
) {
    console.log("rerender async numeric input")

    const [minMax, setMinMax] = useState({ min: undefined, max: undefined } as { min?: number, max?: number });
    const isLoadingRef = useRef(false);

    useEffect(() => {
        isLoadingRef.current = true;
        loadMinMax()
            .then(minMax => setMinMax(minMax))
            .then(() => isLoadingRef.current = false);
    }, [loadMinMax]);

    return <NumericInput
        id={id}
        value={value}
        disabled={isLoadingRef.current}
        onChange={onChange}
        minMax={minMax}
        className={className}
    />
}