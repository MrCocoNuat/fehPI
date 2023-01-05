import { GrowthVectorDao } from "./types/growth-vector-dao";
import { HeroDao }from "./types/hero-dao";
import { MessageDao } from "./types/message-dao";
import { SkillDao } from "./types/skill-dao";

export const skillDao = new SkillDao({repoPath: "files/assets/Common/SRPG/Skill", timerLabel: "TIME: Skill Definition DAO finished initialization"});
export const heroDao = new HeroDao({repoPath: "files/assets/Common/SRPG/Person", timerLabel: "TIME: Hero Definition DAO finished initialization"});
export const messageDao = new MessageDao();
export const growthVectorDao = new GrowthVectorDao({repoPath: "files/assets/Common/SRPG/Grow.json", isBlob: true, timerLabel: "TIME: Growth Vector DAO finished initialization"})