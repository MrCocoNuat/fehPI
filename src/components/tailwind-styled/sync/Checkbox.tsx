import { ChangeEventHandler } from "react"

export function Checkbox({
    id,
    checked,
    onChange,
    disabled,
} : {
    id: string,
    checked?: boolean,
    onChange: ChangeEventHandler<HTMLInputElement>,
    disabled?: boolean,
}) {
    return <input id="unit-resplendent" type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange} />
}