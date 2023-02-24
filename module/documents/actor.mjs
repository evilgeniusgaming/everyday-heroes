/**
 * Extended version of `Actor` class to support Everyday Heroes features.
 */
export default class ActorEH extends Actor {

	prepareBaseData() {
		this.system.prepareBaseData?.();
	}

	prepareDerivedData() {
		this.system.prepareDerivedData?.();
	}

}
