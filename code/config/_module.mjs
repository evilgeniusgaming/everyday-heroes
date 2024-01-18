import * as actor from "./actor.mjs";
import * as general from "./general.mjs";
import * as item from "./item.mjs";
import * as registration from "./registration.mjs";
import * as utils from "./utils.mjs";

const ASCII = ""
+ "    ______                          __            \n"
+ "   / ____/   _____  _______  ______/ /___ ___  __ \n"
+ "  / __/ | | / / _ \\/ ___/ / / / __  / __ `/ / / / \n"
+ " / /___ | |/ /  __/ /  / /_/ / /_/ / /_/ / /_/ /  \n"
+ "/_____/ |___/\\___/_/   \\__, /\\__,_/\\__,_/\\__, /   \n"
+ "          / / / /__  _/____/__  ___  ___/____/    \n"
+ "         / /_/ / _ \\/ ___/ __ \\/ _ \\/ ___/        \n"
+ "        / __  /  __/ /  / /_/ /  __(__  )         \n"
+ "       /_/ /_/\\___/_/   \\____/\\___/____/          \n";

const config = {
	ASCII,
	...actor,
	...general,
	...item,
	registration,
	utils
};
export default config;

/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */
/*  Enrichment                               */
/* ~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~ */

let _enrichmentLookup;
Object.defineProperty(config, "enrichmentLookup", {
	get() {
		const slugify = value => value?.slugify().replaceAll("-", "");
		if ( !_enrichmentLookup ) {
			_enrichmentLookup = {
				abilities: foundry.utils.deepClone(this.abilities),
				skills: foundry.utils.deepClone(this.skills)
			};
			const addFullKeys = key => Object.entries(this[key]).forEach(([k, v]) =>
				_enrichmentLookup[key][slugify(v.fullKey)] = { ...v, key: k }
			);
			addFullKeys("abilities");
			addFullKeys("skills");
		}
		return _enrichmentLookup;
	},
	enumerable: true
});
