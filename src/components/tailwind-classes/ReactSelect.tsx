import { SingleValue } from "react-select"
import Select from "react-select";

export function ReactSelect<optionType = unknown>({
    id,
    value,
    onChange,
    options,
}: {
    id: string,
    value: optionType,
    onChange: (choice: SingleValue<optionType>) => void,
    options: optionType[],
}) {

    return <Select
        id={id}
        value={value}
        onChange={onChange}
        options={options}
    />
}