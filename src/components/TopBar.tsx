import { useTheme } from "next-themes";

export function TopBar() {
    const { theme, setTheme } = useTheme();

    return <>
        <nav className="bg-red-900 text-white h-[50px] w-full absolute top-0 flex justify-between items-center z-50">
            <div>logo</div>
            <div>name</div>
            <div className="flex gap-10">
                <button onClick={() => setTheme((theme === "dark") ? "light" : "dark")} className="rounded-full  bg-blue-800 hover:bg-blue-700 active:bg-blue-900 py-1 px-4 m-2">dark</button>
                <div>lang</div>
            </div>
        </nav>
        <div className="h-[50px]"></div>
    </>
}