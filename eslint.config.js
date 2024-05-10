import stylistic from "@stylistic/eslint-plugin";
import jsdoc from "eslint-plugin-jsdoc";
import plugin from "eslint-plugin-eslint-plugin";
import mocha from "eslint-plugin-mocha";
import globals from "globals";

export default [
	stylistic.configs.customize({
		indent: "tab",
		quotes: "double",
		semi: true,
		jsx: true,
	}),
	jsdoc.configs["flat/recommended-typescript-flavor"],
	// sonarjs.configs["flat/recommended"],
	plugin.configs["flat/recommended"],
	// css.configs["flat/recommended"],
	// promise.configs["flat/recommended"],
	mocha.configs.flat.recommended,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		plugins: {
			"@stylistic": stylistic,
			"jsdoc": jsdoc,
			"mocha": mocha,
		},
		rules: {
			"@stylistic/arrow-parens": ["error", "as-needed"],
			"jsdoc/require-param-description": 0,
			"jsdoc/require-param": 0,
			"jsdoc/require-returns-description": 0,
			"jsdoc/require-returns": 0,
			"jsdoc/require-property-description": 0,
			// "jsdoc/check-param-names": 0,
			// "mocha/no-setup-in-describe": 0,
		},
	},
];
