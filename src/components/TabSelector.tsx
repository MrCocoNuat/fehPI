import { getAllEnumEntries, getAllEnumKeys, getAllEnumValues } from "enum-for";


export enum Tab {
    STATUS,
    HISTORY
}

export function TabSelector(
    {
        selectedTab,
        updateSelectedTab
    }: {
        selectedTab: Tab,
        updateSelectedTab: (tab: Tab) => void
    }
) {

    // UI-specific strings also need translations

    return <div className="flex justify-around">
        {getAllEnumValues(Tab).map((tab) => <TabButton key={tab} tabName={Tab[tab]} selected={tab === selectedTab} clickHandler={() => updateSelectedTab(tab)}></TabButton>)}
    </div>
}

function TabButton(
    {
        tabName,
        clickHandler,
        selected
    }: {
        tabName: string,
        clickHandler: () => void,
        selected: boolean
    }) {

    const selectionClassName = (selected) ? "ring-4" : "";
    return <button
        className={`rounded-full bg-blue-800 hover:bg-blue-700 active:bg-blue-900 ${selectionClassName} ring-offset-2 text-white py-1 px-4 m-2`}
        onClick={clickHandler}
    >
        {tabName}
    </button>
}