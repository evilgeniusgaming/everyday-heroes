import SparseDataModel from "../abstract/sparse-data-model.mjs";
import AdvancementDataField from "../fields/advancement-data-field.mjs";
import IdentifierField from "../fields/identifier-field.mjs";

/**
 * Base data model for advancement.
 */
export default class BaseAdvancement extends SparseDataModel {

	/**
	 * Name of this advancement type that will be stored in config and used for lookups.
	 * @type {string}
	 * @protected
	 */
	static get typeName() {
		return this.name.replace(/Advancement$/, "");
	}

	/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

	static defineSchema() {
		return {
			_id: new foundry.data.fields.DocumentIdField({initial: () => foundry.utils.randomID()}),
			_type: new foundry.data.fields.StringField({
				required: true, initial: this.typeName, validate: v => v === this.typeName,
				validationError: `must be the same as the Advancement type name ${this.typeName}`
			}),
			identifier: new IdentifierField({label: "", hint: ""}),
			configuration: new AdvancementDataField(this, {required: true}),
			value: new AdvancementDataField(this, {required: true}),
			level: new foundry.data.fields.NumberField({
				integer: true, initial: this.metadata?.multiLevel ? undefined : 1, min: 0, label: "EH.Level.Label[one]"
			}),
			title: new foundry.data.fields.StringField({initial: undefined, label: "EH.Advancement.Core.Title"}),
			icon: new foundry.data.fields.FilePathField({
				initial: undefined, categories: ["IMAGE"], label: "EH.Advancement.Core.Icon"
			}),
			flags: new foundry.data.fields.ObjectField()
		};
	}
}
