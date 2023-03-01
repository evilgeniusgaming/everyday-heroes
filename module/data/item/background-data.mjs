import SystemDataModel from "../abstract/system-data-model.mjs";
import AdvancementTemplate from "./templates/advancement-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";

/**
 * Data definition for Background items.
 */
export default class BackgroundData extends SystemDataModel.mixin(DescribedTemplate, AdvancementTemplate) {}
