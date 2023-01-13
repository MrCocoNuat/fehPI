import { Options, SelectInstance, SingleValue } from "react-select"
import Select from "react-select";
import { getUiStringResource } from "../ui-resources";
import { MutableRefObject, RefObject, useContext, useRef } from "react";
import { LanguageContext } from "../../pages/testpage";
import { ValueAndLabel } from "./Select";

/*
 react-select is not known for having great performance with lists of any significant length (as in >100)
 https://github.com/JedWatson/react-select/issues/3128#issuecomment-451936743

 A common tactic to increase search/filter speed is to ignoreAccents since lots of data does not depend on accents/diacritics.
 This cannot be done here since lots of relevant strings do use diacritics and therefore must be searchable with those.

 Another strategy to increase scrollover speed is to replace the Option component with one that throws out onMouseMove and onMouseOver event handlers,
 but this makes keyboard navigation not cooperate with the mouse, so this is also a no go unless performance is so bad that it is necessary.
*/
const BLANK = " ";
export function FilterSelect<ValueType>({
    id,
    value,
    onChange,
    options,
    className,
    isLoading,
}: {
    id: string,
    value?: ValueType,
    onChange: (choice: SingleValue<ValueAndLabel<ValueType>>) => void,
    options: Options<ValueAndLabel<ValueType>>,
    className?: string,
    isLoading?: boolean,
}) {
    const selectedLanguage = useContext(LanguageContext);

    const valueAndLabel = value === undefined ?
        undefined :
        options.find(option => option.value === value)!;
    return <Select
        className={className}
        unstyled={false}
        id={id}
        value={valueAndLabel}
        onChange={onChange}
        placeholder={""}
        noOptionsMessage={(input) => getUiStringResource(selectedLanguage, "SELECT_NO_OPTIONS") as string}
        loadingMessage={(input) => getUiStringResource(selectedLanguage, "SELECT_LOADING") as string}
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
