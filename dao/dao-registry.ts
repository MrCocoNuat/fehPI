import { HeroDao } from "./hero-dao";
import { SkillDao } from "./skill-dao";

export const skillDao = new SkillDao({REPO_PATH: "files/assets/Common/SRPG/Skill", TIMER_LABEL: "TIME: Skill Definition DAO finished initialization"});
export const heroDao = new HeroDao({REPO_PATH: "files/assets/Common/SRPG/Person", TIMER_LABEL: "TIME: Hero Definition DAO finished initialization"});
