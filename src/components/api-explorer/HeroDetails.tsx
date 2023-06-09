import { MouseEvent, useContext, useState } from "react";
import { HeroQueryResult } from "../../pages/explorer/hero/[heroId]";
import { LanguageContext } from "../../pages/_app";
import Image from "next/image";
import { blessingIcons, getUiStringResource, getUiStringResourceForSeries, honorTypeIcon, movementTypeIcon, resplendentIcon, weaponTypeIcon } from "../ui-resources";
import { HonorType, Series } from "../../pages/api/dao/types/dao-types";
import { Checkbox } from "../tailwind-styled/sync/Checkbox";
import { StatCalculator } from "./StatCalculator";
import Link from "next/link";
import { Button } from "../tailwind-styled/sync/Button";


function HeroHonor({ heroDetails }: { heroDetails: HeroQueryResult }) {
    switch (heroDetails.honorType) {
        case HonorType.NONE:
            return <></>
        case HonorType.DUO:
        case HonorType.HARMONIC:
        case HonorType.ASCENDED:
        case HonorType.REARMED:
            return <div className="w-8 aspect-square relative">
                {honorTypeIcon(heroDetails.honorType)}
            </div>
        case HonorType.LEGENDARY:
        case HonorType.MYTHIC:
            return <div className="flex flex-row">
                {blessingIcons(heroDetails.blessingSeason!, heroDetails.blessingEffect!).map((image, i) =>
                    <div className="w-8 aspect-square relative" key={i}> {image} </div>)}
            </div>
    }
}

export function HeroDetailsMini({ hero }: {
    hero: {
        name: { value: string },
        epithet: { value: string },
        idNum: number,
        imageUrl: string,
    }
}) {
    return <div className="flex flex-row gap-2 items-center" key={hero.idNum}>
        <div className="aspect-square w-16 relative">
            <Image src={hero.imageUrl} alt={`portrait of hero ${hero.idNum}`} width={64} height={64} />
        </div>
        <Link href={`/explorer/hero/${hero.idNum}`} className="flex-col flex">
            <div className="flex-row flex gap-1 items-center">
                <div>{`${hero.name.value}`}</div>
                <div className="text-sm">{`(${hero.idNum})`}</div>
            </div>
            <div className="text-sm">{`${hero.epithet.value}`}</div>
        </Link>
    </div>
}


export function HeroDetails({ heroDetails }: { heroDetails: HeroQueryResult }) {
    const selectedLanguage = useContext(LanguageContext);

    const [useResplendent, setUseResplendent] = useState(false);
    if (useResplendent && !heroDetails.resplendentExists) {
        setUseResplendent(false);
    }

    return <div className="flex flex-col w-[600px] h-[600px] gap-2">
        <div className="flex flex-row justify-center items-start gap-1 p-2 bg-blue-500/25  rounded-xl">
            <div className="flex flex-col items-center gap-1">
                <div className="aspect-square w-36 border-8 border-blue-500/25 rounded-xl bg-blue-500/25">
                    <div className="relative aspect-square rounded-lg overflow-hidden">
                    <Image src={useResplendent ? heroDetails.resplendentImageUrl! : heroDetails.imageUrl}
                        alt={`Portrait of ${heroDetails.name.value}`} fill={true} />
                        </div>
                </div>
                {heroDetails.resplendentExists && <Button className="px-1 bg-blue-500/50" onClick={() => setUseResplendent(!useResplendent)}
                    value={<div className={`relative w-8 aspect-square ${useResplendent ? "" : "opacity-50"}`}>
                        {resplendentIcon()}
                    </div>} />}
                <div className="flex flex-row p-1 pr-0 bg-blue-500/25  rounded-xl">
                    <div className="relative w-6 aspect-square">
                        {movementTypeIcon(heroDetails.movementType)}
                    </div>
                    <div className="relative w-6 aspect-square">
                        {weaponTypeIcon(heroDetails.weaponType)}
                    </div>
                </div>
                {heroDetails.honorType != HonorType.NONE && <div className="bg-blue-500/25  p-1 rounded-xl">
                    <HeroHonor heroDetails={heroDetails} />
                </div>}
            </div>
            <div className="flex flex-col bg-blue-500/25  rounded-xl p-2">
                <div className="text-2xl">{`${heroDetails.name.value} - ${heroDetails.epithet.value} (${heroDetails.idNum})`}</div>
                <div className="">{heroDetails.idTag}</div>
                <div>{heroDetails.origins.map(series => getUiStringResourceForSeries(selectedLanguage, series)).join(" & ")}</div>
                {(heroDetails.refresher) && <div className="text-green-600 font-bold">{getUiStringResource(selectedLanguage, "HERO_REFRESHER")}</div>}
            </div>
        </div>
        <div>
            <StatCalculator heroIdNum={heroDetails.idNum} useResplendent={useResplendent} maxDragonflowers={heroDetails.maxDragonflowers} movementType={heroDetails.movementType} />
        </div>
    </div>
}