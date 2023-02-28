import ArchetypeData from "./archetype-data.mjs";
import BackgroundData from "./background-data.mjs";
import ClassData from "./class-data.mjs";
import ProfessionData from "./profession-data.mjs";

export {
	ArchetypeData,
	BackgroundData,
	ClassData,
	ProfessionData
};
export {default as AdvancementTemplate} from "./templates/advancement-template.mjs";
export {default as DescribedTemplate} from "./templates/described-template.mjs";

export const config = {
	archetype: ArchetypeData,
	background: BackgroundData,
	class: ClassData,
	profession: ProfessionData
};
