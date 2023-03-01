import SystemDataModel from "../abstract/system-data-model.mjs";
import AdvancementTemplate from "./templates/advancement-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";

/**
 * Data definition for Profession items.
 */
export default class ProfessionData extends SystemDataModel.mixin(DescribedTemplate, AdvancementTemplate) {}
