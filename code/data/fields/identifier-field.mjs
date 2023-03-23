import { validators } from "../../utils.mjs";

/**
 * Special case StringField that includes automatic validation for identifiers.
 */
export default class IdentifierField extends foundry.data.fields.StringField {
	_validateType(value) {
		if ( !validators.isValidIdentifier(value) ) {
			throw new Error(game.i18n.localize("EH.Identifier.Error.Invalid"));
		}
	}
}
