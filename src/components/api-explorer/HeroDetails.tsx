import { useContext } from "react";
import { HeroQueryResult } from "../../pages/explorer/hero/[heroId]";
import { LanguageContext } from "../../pages/_app";
import Image from "next/image";
import { getUiStringResource, movementTypeIcon, weaponTypeIcon } from "../ui-resources";

export function HeroDetails({ heroDetails }: { heroDetails: HeroQueryResult }) {
    const selectedLanguage = useContext(LanguageContext);

    return <div className="border-2 border-red-500 flex flex-col w-[600px]">
        <div className="flex flex-row justify-center align-center border-2 border-green-500 gap-1">
            <div className="flex flex-col items-center">
                <div className="aspect-square w-24 relative">
                    <Image src={heroDetails.imageUrl} alt={`Portrait of ${heroDetails.name.value}`} fill={true} />
                </div>
                <div>
                    Resp switch
                </div>
                <div className="flex flex-row">
                    <div className="relative w-6 aspect-square">
                        {movementTypeIcon(heroDetails.movementType)}
                    </div>
                    <div className="relative w-6 aspect-square">
                        {weaponTypeIcon(heroDetails.weaponType)}
                    </div>
                </div>
                <div>
                    Honor
                </div>
            </div>
            <div className="border-2 border-blue-500 flex flex-col">
                <div className="text-2xl">{`${heroDetails.name.value} - ${heroDetails.epithet.value} (${heroDetails.idNum})`}</div>
                <div className="">{heroDetails.idTag}</div>
                <div>Origins</div>
                {(heroDetails.refresher) && <div className="border-2 border-yellow-500 text-green-600 font-bold">{getUiStringResource(selectedLanguage, "HERO_REFRESHER")}</div>}
            </div>
        </div>
        <div>
            Stat calculator
        </div>
    </div>
}