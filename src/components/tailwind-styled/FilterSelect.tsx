import { SingleValue } from "react-select"
import Select from "react-select";
import { getUiStringResource } from "../ui-resources";
import { useContext } from "react";
import { LanguageContext } from "../../pages/testpage";

/*
 react-select is not known for having great performance with lists of any significant length (as in >100)
 https://github.com/JedWatson/react-select/issues/3128#issuecomment-451936743

 A common tactic to increase search/filter speed is to ignoreAccents since lots of data does not depend on accents/diacritics.
 This cannot be done here since lots of relevant strings do use diacritics and therefore must be searchable with those.

 Another strategy to increase scrollover speed is to replace the Option component with one that throws out onMouseMove and onMouseOver event handlers,
 but this makes keyboard navigation not cooperate with the mouse, so this is also a no go unless performance is so bad that it is necessary.
*/

export type ValueAndLabel = { value: number, label: string };

export function FilterSelect({
    id,
    value,
    onChange,
    options,
    className,
    isLoading,
}: {
    id: string,
    value: ValueAndLabel,
    onChange: (choice: SingleValue<ValueAndLabel>) => void,
    options: ValueAndLabel[],
    className?: string,
    isLoading?: boolean,
}) {
    const selectedLanguage = useContext(LanguageContext);
    return <Select
        className={className}
        unstyled={false}
        id={id}
        value={value}
        onChange={onChange}
        noOptionsMessage={(input) => getUiStringResource(selectedLanguage, "SELECT_NO_OPTIONS") as string}
        options={options}
        isLoading={isLoading}
        classNames={{
            // apply tailwind classes to some inner components
            menuList: (state) => "rounded-md ring-1 ring-neutral-500 bg-white dark:bg-neutral-900 text-black dark:text-white",
            option: (state) => (state.isFocused ? "dark:bg-neutral-700" : ""),
            valueContainer: (state) => "dark:bg-neutral-900",
            input: (state) => "text-black dark:text-white",
            indicatorsContainer: (state) => "dark:bg-neutral-900",
            singleValue: (state) => "dark:text-neutral-200",
        }}
    />
}