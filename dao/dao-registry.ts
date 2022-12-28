import { HeroDao }from "./types/hero-dao";
import { SkillDao } from "./types/skill-dao";

export const skillDao = new SkillDao({repoPath: "files/assets/Common/SRPG/Skill", timerLabel: "TIME: Skill Definition DAO finished initialization"});
export const heroDao = new HeroDao({repoPath: "files/assets/Common/SRPG/Person", timerLabel: "TIME: Hero Definition DAO finished initialization"});
