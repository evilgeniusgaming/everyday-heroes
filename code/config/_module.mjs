import * as actor from "./actor.mjs";
import * as general from "./general.mjs";
import * as item from "./item.mjs";
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

export default {
	ASCII,
	...actor,
	...general,
	...item,
	utils
};
