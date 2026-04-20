/**
 * Monkey-patch existing `DataField` types with active effect application methods. This is a temporary patch until
 * https://github.com/foundryvtt/foundryvtt/issues/6631 is implemented.
 */
export default function applyEffectApplicationPatches() {

	// Note: OVERRIDE and CUSTOM are always supported modes, _ehSupportedModes defines other modes that can be used
	let field;

	// DataField
	field = foundry.data.fields.DataField;
	field._ehSupportedModes = [];
	field.prototype._ehApplyAdd = function(document, change, current, delta, changes) {};
	field.prototype._ehApplyMultiply = function(document, change, current, delta, changes) {};
	field.prototype._ehApplyUpgrade = function(document, change, current, delta, changes) {};
	field.prototype._ehApplyDowngrade = function(document, change, current, delta, changes) {};
	field.prototype._ehApplyOverride = function(document, change, current, delta, changes) {
		changes[change.key] = delta;
	};
	field.prototype._ehCastDelta = function(value) {
		return this._cast(value);
	};
	field.prototype._ehValidateDelta = function(value) {
		return this._validateType(value);
	};

	// ArrayField
	field = foundry.data.fields.ArrayField;
	field.prototype._ehApplyAdd = function(document, change, current, delta, changes) {
		changes[change.key] = current.concat(delta);
	};
	field.prototype._ehCastArray = function(raw) {
		const delta = raw instanceof Array ? raw : [raw];
		return delta.map(e => this.element._ehCastDelta(e));
	};
	field.prototype._ehCastDelta = function(value) {
		return this._ehCastArray(value);
	};

	// BooleanField
	field = foundry.data.fields.BooleanField;
	field.prototype._ehApplyUpgrade = function(document, change, current, delta, changes) {
		if ( (current === null) || (current === undefined) || (delta > current) ) changes[change.key] = delta;
	};
	field.prototype._ehApplyDowngrade = function(document, change, current, delta, changes) {
		if ( (current === null) || (current === undefined) || (delta < current) ) changes[change.key] = delta;
	};

	// NumberField
	field = foundry.data.fields.NumberField;
	field.prototype._ehApplyAdd = function(document, change, current, delta, changes) {
		changes[change.key] = current + delta;
	};
	field.prototype._ehApplyMultiply = function(document, change, current, delta, changes) {
		changes[change.key] = current * delta;
	};
	field.prototype._ehApplyUpgrade = function(document, change, current, delta, changes) {
		if ( (current === null) || (current === undefined) || (delta > current) ) changes[change.key] = delta;
	};
	field.prototype._ehApplyDowngrade = function(document, change, current, delta, changes) {
		if ( (current === null) || (current === undefined) || (delta < current) ) changes[change.key] = delta;
	};

	// SetField
	field = foundry.data.fields.SetField;
	field.prototype._ehApplyAdd = function(document, change, current, delta, changes) {
		changes[change.key] = current;
		delta.forEach(e => changes[change.key].add(e));
	};
	field.prototype._ehApplyOverride = function(document, change, current, delta, changes) {
		changes[change.key] = new Set();
		delta.forEach(e => changes[change.key].add(e));
	};

	// StringField
	field = foundry.data.fields.StringField;
	field.prototype._ehApplyAdd = function(document, change, current, delta, changes) {
		changes[change.key] = current + delta;
	};
}
