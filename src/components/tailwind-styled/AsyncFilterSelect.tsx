import { useEffect, useRef, useState } from "react";
import { SingleValue } from "react-select";
import { FilterSelect } from "./FilterSelect";
import { ValueAndLabel } from "./Select";

// react-select's own async functionality is insufficient for me - need more precise control of isLoading

type SyncPropFunctionType<ValueType> = ((value?: ValueType) => void) | ((value?: ValueType) => Promise<void>);
type SyncPropType<ValueType> = boolean | SyncPropFunctionType<ValueType>;

function syncPropIsFunction<ValueType>(syncProp: SyncPropType<ValueType>): syncProp is SyncPropFunctionType<ValueType> {
    return !(true === (syncProp) || false === (syncProp));
}

export function AsyncFilterSelect<ValueType>({
    id,
    value,
    onChange,
    loadOptions,
    className,
    syncValueWithLoadOptions,
}: {
    id: string,
    // this should work more like HTML select, where you just give a value and the label is automatically applied!
    value?: ValueType,
    onChange: (choice: SingleValue<ValueAndLabel<ValueType>>) => void,
    loadOptions: () => Promise<ValueAndLabel<ValueType>[]>,
    className?: string,
    // either pass simple boolean, or a callback that is called whenever value sync happens
    syncValueWithLoadOptions?: SyncPropType<ValueType>,
}) {
    const [options, setOptions] = useState([] as ValueAndLabel<ValueType>[]);
    const isLoadingRef = useRef(true);

    // when loadOptions changes, syncedValue should not change until the new options is ready!
    // otherwise the new value will be used with the old options (not loaded yet) and create garbage
    const syncedValueRef = useRef(undefined as ValueType | undefined);

    useEffect(() => {
        isLoadingRef.current = true;
        loadOptions().then(initialOptions => {
            isLoadingRef.current = false;
            // Now it is safe to change
            syncedValueRef.current = value;
            // if requested, call the callback
            if (syncValueWithLoadOptions && syncPropIsFunction(syncValueWithLoadOptions)) {
                syncValueWithLoadOptions(syncedValueRef.current);
            }
            // and rerender!
            setOptions(initialOptions);
        });
    }, [loadOptions])

    return <FilterSelect id={id} className={className}
        value={syncValueWithLoadOptions ? syncedValueRef.current : value}
        onChange={(choice) => {
            // a change from onChange will not have a different loadOptions
            // so syncedValue needs to change to the new value here too
            syncedValueRef.current = choice?.value;
            if (syncValueWithLoadOptions && syncPropIsFunction(syncValueWithLoadOptions)) {
                syncValueWithLoadOptions(syncedValueRef.current);
            }
            // this handler will trigger a rerender by passing in a new value prop
            // ... at least it should, what else would a onChange handler do?
            onChange(choice);
        }}
        options={options}
        isLoading={isLoadingRef.current}
        isDisabled={isLoadingRef.current}
    />
}