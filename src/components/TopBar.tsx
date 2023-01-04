import { getAllEnumEntries, getAllEnumValues } from "enum-for";
import { useTheme } from "next-themes";
import { Dispatch, SetStateAction } from "react";
import { Language } from "../dao/types/dao-types";

import { MoonIcon, SunIcon, BeakerIcon } from "@heroicons/react/24/solid";
import { Button } from "./tailwind-classes/Button";

export function TopBar(
    {
        currentLanguage,
        updateCurrentLanguage
    }: {
        currentLanguage: Language,
        updateCurrentLanguage: Dispatch<SetStateAction<Language>>
    }) {

    const { theme, setTheme } = useTheme();

    return <>
        <nav className="dark:bg-red-800 bg-blue-300 h-[50px] w-full fixed top-0 flex justify-between items-center z-50">
            <div>logo</div>
            <div>name</div>
            <div className="flex gap-2">
                <Button onClick={() => setTheme((theme === "dark") ? "light" : "dark")}
                    value={(theme === "dark") ? <MoonIcon className="h-6 w-6 text-white" /> : <SunIcon className="h-6 w-6" />}/>
                <select className="m-2" defaultValue={currentLanguage}>
                    {getAllEnumEntries(Language).map(([languageName, language]) => <option key={language} value={language}>{languageName}</option>)}
                </select>
            </div>
        </nav>
        <div className="h-[50px]"></div>
    </>
}