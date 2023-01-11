import { useContext, useEffect, useRef, useState } from "react";
import { GroupBase, Options, OptionsOrGroups, SelectInstance, SingleValue } from "react-select";
import AsyncSelect from "react-select/async";
import { LanguageContext } from "../../pages/testpage";
import { getUiStringResource } from "../ui-resources";
import { FilterSelect, ValueAndLabel } from "./FilterSelect";

// react-select's own async functionality is insufficient for me

export function AsyncFilterSelect({
    id,
    valueAndLabelFromOptions,
    onChange,
    loadInitialOptions,
    className,
}: {
    id: string,
    // while react-select can accept a value, there will be no label
    valueAndLabelFromOptions: (options: Options<ValueAndLabel>) => ValueAndLabel,
    onChange: (choice: SingleValue<ValueAndLabel>) => void,
    loadInitialOptions: (() => Promise<ValueAndLabel[]>),
    className?: string,
}) {
    const [options, setOptions] = useState([] as ValueAndLabel[]);
    const [value, setValue] = useState({ value: 0, label: "" } as ValueAndLabel);
    useEffect(() => {
        loadInitialOptions().then(initialOptions => {
            setOptions(initialOptions);
            setValue(valueAndLabelFromOptions(initialOptions));
        });
    }, [loadInitialOptions])

    return <FilterSelect id={id} className={className}
        value={value}
        onChange={onChange}
        options={options}
        isLoading={options.length === 0}
    />
}