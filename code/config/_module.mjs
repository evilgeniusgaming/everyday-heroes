import * as actor from "./actor.mjs";
import * as general from "./general.mjs";
import * as item from "./item.mjs";
import * as utils from "./utils.mjs";

export default {
	...actor,
	...general,
	...item,
	utils
};
