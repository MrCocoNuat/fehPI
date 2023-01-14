import { useEffect, useRef, useState } from "react";
import { SingleValue } from "react-select";
import { FilterSelect } from "./FilterSelect";
import { ValueAndLabel } from "./Select";

// react-select's own async functionality is insufficient for me - need more precise control of isLoading

export function AsyncFilterSelect<ValueType>({
    id,
    value,
    onChange,
    loadOptions,
    className,
}: {
    id: string,
    // this should work more like HTML select, where you just give a value and the label is automatically applied!
    value?: ValueType,
    onChange: (choice: SingleValue<ValueAndLabel<ValueType>>) => void,
    loadOptions: () => Promise<ValueAndLabel<ValueType>[]>,
    className?: string,
}) {
    const [options, setOptions] = useState([] as ValueAndLabel<ValueType>[]);
    const isLoadingRef = useRef(true);

    useEffect(() => {
        isLoadingRef.current = true;
        loadOptions().then(initialOptions => {
            isLoadingRef.current = false;
            setOptions(initialOptions);
        });
    }, [loadOptions])

    return <FilterSelect id={id} className={className}
        value={value}
        onChange={onChange}
        options={options}
        isLoading={isLoadingRef.current}
        isDisabled={isLoadingRef.current}
    />
}