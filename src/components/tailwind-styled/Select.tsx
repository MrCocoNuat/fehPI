import ReactSelect from "react-select";
import { SingleValue } from "react-select"

export function Select<optionType>({
    id,
    value,
    onChange,
    options,
    className,
}: {
    id: string,
    value: optionType,
    onChange: (choice: SingleValue<optionType>) => void,
    options: optionType[],
    className?: string,
}) {
    return <ReactSelect
        className={className}
        unstyled={false}
        id={id}
        value={value}
        onChange={onChange}
        options={options}
        isSearchable={false}
        classNames={{
            // apply tailwind classes to some inner components
            menuList: (state) => "rounded-md ring-1 ring-neutral-500 bg-white dark:bg-neutral-900 text-black dark:text-white",
            option: (state) => (state.isFocused ? "dark:bg-neutral-700" : ""),
            valueContainer: (state) => "dark:bg-neutral-900",
            input: (state) => "text-black dark:text-white",
            indicatorsContainer: (state) => "dark:bg-neutral-900",
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
