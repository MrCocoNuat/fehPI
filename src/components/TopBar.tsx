import { getAllEnumEntries, getAllEnumValues } from "enum-for";
import { useTheme } from "next-themes";
import { Dispatch, SetStateAction } from "react";
import { LANGUAGE_CODES, Language } from "../pages/api/dao/types/dao-types";

import { MoonIcon, SunIcon, LanguageIcon } from "@heroicons/react/24/solid";
import { Button } from "./tailwind-styled/sync/Button";
import { logo } from "./ui-resources";
import Link from "next/link";

// this is NOT a ui string resource - it is tied to FEH's languages (e.g. USES !== EUES)
const languageNames = {
    [Language.EUDE]: "Deutsch",
    [Language.EUEN]: "English (UK)",
    [Language.EUES]: "Español (Es.)",
    [Language.EUFR]: "Français",
    [Language.EUIT]: "Italiano",
    [Language.JPJA]: "日本語",
    [Language.TWZH]: "中文 (繁體)",
    [Language.USEN]: "English (Am.)",
    [Language.USES]: "Español (Am.)",
    [Language.USPT]: "Português",
} as const;

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
        <nav className="dark:bg-blue-900/50 bg-blue-300 h-[50px] w-full fixed top-0 left-0 flex justify-between items-center z-50">
            <Link 
                href={"/"}
                className="left-1 relative aspect-square w-10">
                {logo()}
            </Link>
        
            <div className="flex gap-2">
                {false && <Button
                    onClick={() => setTheme((theme === "dark") ? "light" : "dark")}
                    className="px-2 py-2"
                    value={(theme === "dark") ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
                />}

                <label htmlFor="language-select">
                    <LanguageIcon className="m-2 mr-0 h-6 w-6" />
                </label>

                <select
                    id="language-select"
                    className="m-2 ml-0 mr-4 w-36 pl-1"
                    defaultValue={currentLanguage}
                    value={currentLanguage}
                    onChange={(evt) => updateCurrentLanguage(+evt.target.value as Language)}
                >
                    {getAllEnumEntries(Language).map(([key, value]) => <option key={value} value={value} lang={LANGUAGE_CODES[value]}>{languageNames[value]}</option>)}
                </select>
            </div>
        </nav>
        <div className="h-[50px]" />
    </>
}