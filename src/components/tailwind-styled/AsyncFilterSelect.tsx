import { useContext, useEffect, useRef, useState } from "react";
import { GroupBase, Options, OptionsOrGroups, SelectInstance, SingleValue } from "react-select";
import AsyncSelect from "react-select/async";
import { LanguageContext } from "../../pages/testpage";
import { getUiStringResource } from "../ui-resources";
import { FilterSelect } from "./FilterSelect";
import { ValueAndLabel } from "./Select";

// react-select's own async functionality is insufficient for me

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
    loadOptions: Promise<ValueAndLabel<ValueType>[]>,
    className?: string,
}) {
    const [options, setOptions] = useState([] as ValueAndLabel<ValueType>[]);
    useEffect(() => {
        setOptions([]);
        loadOptions.then(initialOptions => {
            setOptions(initialOptions);
        });
    }, [value, loadOptions])

    return <FilterSelect id={id} className={className}
        value={options.length === 0? undefined : value}
        onChange={onChange}
        options={options}
        isLoading={options.length === 0}
    />
}