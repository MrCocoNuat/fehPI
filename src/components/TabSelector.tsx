import { getAllEnumEntries, getAllEnumKeys, getAllEnumValues } from "enum-for";
import { Button } from "./tailwind-styled/sync/Button";


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

    return <div className="flex justify-around m-2">
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

    const paddingCss = "px-4 py-1";
    const selectionCss = (selected) ? "ring-4 ring-blue-400 dark:ring-purple-400" : "";
    return <Button className={`${paddingCss} ${selectionCss}`}
        onClick={clickHandler}
        value={tabName}
    />

}