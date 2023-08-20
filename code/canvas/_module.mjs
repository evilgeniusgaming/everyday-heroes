import TokenLayerEH from "./token-layer.mjs";
import TokenEH from "./token.mjs";

/**
 * Register custom token class and any other canvas systems.
 */
export function registerCanvas() {
	CONFIG.Canvas.layers.tokens.layerClass = TokenLayerEH;
	CONFIG.Token.layerClass = TokenLayerEH;
	CONFIG.Token.objectClass = TokenEH;
}

export {TokenLayerEH, TokenEH};
export {default as SuppressiveFireTemplate} from "./suppressive-fire-template.mjs";
export {default as patchTokenHUD} from "./token-hud.mjs";
