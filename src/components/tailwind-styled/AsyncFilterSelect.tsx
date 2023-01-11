import { useContext, useEffect, useRef, useState } from "react";
import { GroupBase, Options, OptionsOrGroups, SelectInstance, SingleValue } from "react-select";
import AsyncSelect from "react-select/async";
import { LanguageContext } from "../../pages/testpage";
import { getUiStringResource } from "../ui-resources";
import { FilterSelect, ValueAndLabel } from "./FilterSelect";

// react-select's own async functionality is insufficient for me

export function AsyncFilterSelect({
    id,
    value,
    onChange,
    loadInitialOptions,
    className,
    otherDependencies: otherDeps,
}: {
    id: string,
    // this should work more like HTML select, where you just give a value and the label is automatically applied!
    value: ValueAndLabel["value"],
    onChange: (choice: SingleValue<ValueAndLabel>) => void,
    loadInitialOptions: (() => Promise<ValueAndLabel[]>),
    className?: string,
    otherDependencies?: any[],
}) {
    const [options, setOptions] = useState([] as ValueAndLabel[]);
    useEffect(() => {
        setOptions([]);
        loadInitialOptions().then(initialOptions => {
            setOptions(initialOptions);
        });
    }, [value, ...(otherDeps ?? [])])

    return <FilterSelect id={id} className={className}
        value={value}
        onChange={onChange}
        options={options}
        isLoading={options.length === 0}
    />
}