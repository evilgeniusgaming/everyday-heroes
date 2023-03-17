import HeroData from "./hero-data.mjs";
import NPCData from "./npc-data.mjs";

export {
	HeroData,
	NPCData
};
export {default as AbilitiesTemplate} from "./templates/abilities-template.mjs";
export {default as InitiativeTemplate} from "./templates/initiative-template.mjs";
export {default as MovementTemplate} from "./templates/movement-template.mjs";
export {default as ResourcesTemplate} from "./templates/resources-template.mjs";
export {default as SkillsTemplate} from "./templates/skills-template.mjs";

export const config = {
	hero: HeroData,
	npc: NPCData
};