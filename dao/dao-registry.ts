import { HeroDao } from "./hero-dao";
import { SkillDao } from "./skill-dao";

export const skillDao = new SkillDao({REPO_PATH: "files/assets/Common/SRPG/Skill", TIMER_LABEL: "TIME: Skill Definition DAO finished initialization"});
export const heroDao = new HeroDao({REPO_PATH: "files/assets/Common/SRPG/Person", TIMER_LABEL: "TIME: Hero Definition DAO finished initialization"});


// Utility methods

// Thanks, https://stackoverflow.com/a/59723513
function objForEach<T>(obj: T, f: (k: keyof T, v: T[keyof T]) => void): void {
    for (let k in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, k)) {
            f(k, obj[k]);
        }
    }
}

export function bitvectorToBitfield<EnumLike>(enumLike: EnumLike, bitvector: number){
    const bitfield : any = {};
    objForEach<EnumLike>(enumLike, (id, value) => {
        // very unfortunate type assertion here... I'm not sure how to get rid of it
        bitfield[id] = (bitvector & (1 << (id as number))) > 0;
    });

    return bitfield as {[id in keyof EnumLike] : boolean};

}