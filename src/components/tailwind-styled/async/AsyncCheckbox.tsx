import { ChangeEvent, ChangeEventHandler, useEffect, useRef, useState } from "react";
import { Checkbox } from "../sync/Checkbox";

// does not properly rerender with false isLoading

export function AsyncCheckbox({
    id,
    checked,
    loadChecked,
    disabled,
    loadDisabled,
    onChange,
}: {
    id: string,
    // either a value or a () => promise to return the value
    checked?: boolean,
    loadChecked?: () => Promise<boolean>,
    disabled?: boolean,
    loadDisabled?: () => Promise<boolean>,
    onChange: ChangeEventHandler<HTMLInputElement>
}
) {
    // setting primitive state variables may not trigger rerender since reference equality still holds
    const [checkedState, setCheckedState] = useState([false]);
    const [disabledState, setDisabledState] = useState([false]);
    const isLoadingRef = useRef(false);

    useEffect(() => {
        isLoadingRef.current = true;
        console.log("reload async checkbox")
        Promise.all([
            loadChecked ? loadChecked() : undefined, // dummy resolves
            loadDisabled ? loadDisabled() : undefined,
        ])
            .then(results => {
                isLoadingRef.current = false;
                if (results[0]) setCheckedState([results[0]]);
                if (results[1]) setDisabledState([results[1]]);
            });
    }, [loadChecked, loadDisabled]);

    console.log("async checkbox rendering subs with", JSON.stringify({ checked: checked ?? checkedState, disabled: disabled ?? disabledState, isLoading: isLoadingRef.current }))
    return <Checkbox id={id}
        checked={checked ?? checkedState[0]}
        disabled={isLoadingRef.current || (disabled ?? disabledState[0])}
        onChange={onChange} />
}