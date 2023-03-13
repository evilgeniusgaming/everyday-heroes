import SystemDataModel from "../abstract/system-data-model.mjs";
import ActivatableTemplate from "./templates/activatable-template.mjs";
import DescribedTemplate from "./templates/described-template.mjs";

/**
 * Data definition for Plan items.
 * @mixes {@link ActivatableTemplate}
 * @mixes {@link DescribedTemplate}
 */
export default class PlanData extends SystemDataModel.mixin(DescribedTemplate, ActivatableTemplate) {}

// TODO: Automatically fix consumption.target to consume a "genius"
