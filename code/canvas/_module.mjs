import TokenEH from "./token.mjs";

/**
 * Register custom token class and any other canvas systems.
 */
export function registerCanvas() {
	CONFIG.Token.objectClass = TokenEH;
}

export {TokenEH};
export {default as SuppressiveFireTemplate} from "./suppressive-fire-template.mjs";
