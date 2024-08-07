import stylistic from "@stylistic/eslint-plugin";
import stylisticTs from "@stylistic/eslint-plugin-ts";
import parserTs from "@typescript-eslint/parser";
import jsdoc from "eslint-plugin-jsdoc";
import plugin from "eslint-plugin-eslint-plugin";
import pluginTs from "@typescript-eslint/eslint-plugin";
import mocha from "eslint-plugin-mocha";
import globals from "globals";

export default [
	{
		...stylistic.configs.customize({
			indent: "tab",
			quotes: "double",
			semi: true,
			jsx: false,
		}),
		files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
		ignores: ["**/out/**/*", "**/android/**/*"],
	}, {
		...stylisticTs.configs["all-flat"],
		files: ["**/*.ts", "**/*.mts"],
		ignores: ["**/out/**/*", "**/android/**/*"],
	}, {
		...jsdoc.configs["flat/recommended-typescript-flavor"],
		files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
		ignores: ["**/out/**/*", "**/android/**/*"],
	}, {
		...jsdoc.configs["flat/recommended-typescript"],
		files: ["**/*.ts", "**/*.mts"],
		ignores: ["**/out/**/*", "**/android/**/*"],
	}, {
		...plugin.configs["flat/recommended"],
		files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
		ignores: ["**/out/**/*", "**/android/**/*"],
	}, {
		...pluginTs.configs["flat/recommended"],
		files: ["**/*.ts", "**/*.mts"],
		ignores: ["**/out/**/*", "**/android/**/*"],
	}, {
		...mocha.configs.flat.recommended,
		files: ["**/*.spec.js"],
		ignores: ["**/out/**/*", "**/android/**/*"],
	}, {
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				...globals.mocha,
				...globals.worker,
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
		},
		files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
		ignores: ["**/out/**/*", "**/android/**/*"],
	}, {
		languageOptions: {
			globals: {
				...globals.node,
			},
			parser: parserTs,
		},
		plugins: {
			"jsdoc": jsdoc,
			"@stylistic/ts": stylisticTs,
		},
		rules: {
			"@stylistic/ts/indent": ["error", "tab"],
			"@stylistic/ts/brace-style": ["error", "stroustrup", { allowSingleLine: true }],
			"@stylistic/ts/lines-between-class-members": ["error", {
				enforce: [
					{ blankLine: "always", prev: "field", next: "field" },
				],
			}, { exceptAfterSingleLine: true }],
			"jsdoc/require-jsdoc": 0,
		},
		files: ["**/*.ts", "**/*.mts"],
		ignores: ["**/out/**/*", "**/android/**/*"],
	},
];
