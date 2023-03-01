import SystemDataModel from "../abstract/system-data-model.mjs";
import AdvancementTemplate from "./templates/advancement-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";

/**
 * Data definition for Class items.
 */
export default class ClassData extends SystemDataModel.mixin(DescribedTemplate, AdvancementTemplate) {}
