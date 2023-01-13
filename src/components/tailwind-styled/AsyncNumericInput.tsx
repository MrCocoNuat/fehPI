// Just as AsyncSelects let you asynchronously load its options,
// AsyncNumericInput lets you asynchronously load min and max, which are like options for NumericInput

import { ChangeEventHandler, useEffect, useState } from "react";
import { NumericInput } from "./NumericInput";

function isAsync(possiblyAsyncEventHandler: ChangeEventHandler<HTMLInputElement> | Promise<ChangeEventHandler<HTMLInputElement>>)
    : possiblyAsyncEventHandler is Promise<ChangeEventHandler<HTMLInputElement>> {
        return (possiblyAsyncEventHandler as ChangeEventHandler<HTMLInputElement>).prototype !== Function.prototype;
    }

export function AsyncNumericInput(
    {
        id,
        value,
        possiblyAsyncOnChange,
        loadMinMax,
        className,
    }: {
        id: string,
        value: number,
        possiblyAsyncOnChange: ChangeEventHandler<HTMLInputElement> | Promise<ChangeEventHandler<HTMLInputElement>>,
        loadMinMax: () => Promise<{ min?: number, max?: number }>,
        className?: string,
    }
) {
    console.log("rerender numeric input")
    const [minMax, setMinMax] = useState({ min: undefined, max: undefined } as { min?: number, max?: number });
    const [isLoading, setLoading] = useState(true);
    // If the onChange handler is synchronous, just set it immediately
    const [onChangeHandler, setOnChangeHandler] = useState(() => isAsync(possiblyAsyncOnChange)? undefined: possiblyAsyncOnChange);
    useEffect(() => {
        setLoading(true);
        Promise.all([
            loadMinMax().then(minMax => {setMinMax(minMax)}),
            // If the onChange handler is asynchronous, then it needs to be set later
            isAsync(possiblyAsyncOnChange)? possiblyAsyncOnChange.then(onChangeHandler => setOnChangeHandler(() => onChangeHandler)) : undefined
        ]).then(() => setLoading(false));
    }, [loadMinMax]);

    return <NumericInput
        id={id}
        value={value}
        disabled={isLoading}
        onChange={onChangeHandler}
        minMax={minMax}
    />
}