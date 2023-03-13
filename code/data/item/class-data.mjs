import SystemDataModel from "../abstract/system-data-model.mjs";
import AdvancementTemplate from "./templates/advancement-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";

/**
 * Data definition for Class items.
 * @mixes {@link AdvancementTemplate}
 * @mixes {@link DescribedTemplate}
 */
export default class ClassData extends SystemDataModel.mixin(DescribedTemplate, AdvancementTemplate) {}
