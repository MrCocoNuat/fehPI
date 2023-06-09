import { useContext } from "react";
import ReactSelect, { Options } from "react-select";
import { SingleValue } from "react-select";
import { getUiStringResource } from "../../ui-resources";
import { LanguageContext } from "../../../pages/_app";

export type ValueAndLabel<ValueType> = {value: ValueType, label: string};

export function Select<ValueType>({
    id,
    value,
    onChange,
    options,
    className,
}: {
    id: string,
    value?: ValueType,
    onChange: (choice: SingleValue<ValueAndLabel<ValueType>>) => void,
    options: Options<ValueAndLabel<ValueType>>,
    className?: string,
}) {
    const selectedLanguage = useContext(LanguageContext);
    const valueAndLabel = options.find(option => option.value === value)!;
    return <ReactSelect
        className={className}
        unstyled={false}
        id={id}
        value={valueAndLabel}
        onChange={onChange}
        options={options}
        isSearchable={false}
        noOptionsMessage={(input) => getUiStringResource(selectedLanguage, "SELECT_NO_OPTIONS") as string}
        classNames={{
            // apply tailwind classes to some inner components
            menuList: (state) => "rounded-md ring-1 ring-neutral-500 bg-white dark:bg-blue-500/25 dark:bg-neutral-900/50 text-black dark:text-white",
            option: (state) => (state.isFocused ? "dark:bg-neutral-700" : ""),
            valueContainer: (state) => "dark:bg-blue-500/25 dark:bg-neutral-900/50",
            input: (state) => "text-black dark:text-white",
            indicatorsContainer: (state) => "dark:bg-blue-500/25 dark:bg-neutral-900/50",
            singleValue: (state) => "dark:text-neutral-200",
            control: (state) => "dark:bg-black",
        }}
        // box sizing styles are stubborn and tailwind cannot override from in classNames
        // these make Select a less prominent / smaller element than FilterSelect which is correct
        styles={{
            dropdownIndicator: (baseStyles, state) => ({
                ...baseStyles,
                padding: 4,
            }),
            indicatorsContainer: (baseStyles, state) => ({
                ...baseStyles,
                paddingTop: 0,
                paddingBottom: 0,
            }),
            control: (baseStyles, state) => ({
                ...baseStyles,
                minHeight: 30,
            }),
        }}
    />
}
