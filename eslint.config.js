import jsdoc from "eslint-plugin-jsdoc";
import stylistic from "@stylistic/eslint-plugin";
import js from "@eslint/js";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import css from "@eslint/css";
import tseslint, { parser } from "typescript-eslint";
import globals from "globals";
import mochaPlugin from "eslint-plugin-mocha";
import { includeIgnoreFile } from "@eslint/compat";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const
	/**
	 * @type {import("eslint").Linter.Config}
	 */
	jsdocConfig = {
		...js.configs.recommended,
		...jsdoc.configs["flat/recommended"],
		plugins: {
			jsdoc,
		},
		rules: {
			"jsdoc/require-param-description": "off",
			"jsdoc/require-param": "off",
			"jsdoc/require-returns-description": "off",
			"jsdoc/require-returns": "off",
			"jsdoc/require-property-description": "off",
			"jsdoc/valid-types": "warn",
		},
	},
	/**
	 * @type {import("eslint").Linter.Config}
	 */
	stylisticConfig = {
		...stylistic.configs["recommended"],
		plugins: {
			// @ts-ignore
			"@stylistic": stylistic,
		},
		rules: {
			"@stylistic/indent": ["error", "tab"],
			"@stylistic/no-tabs": ["off"],
			"@stylistic/quotes": ["error", "double"],
			"@stylistic/linebreak-style": ["error", "unix"],
			"@stylistic/semi-style": ["error", "last"],
			"@stylistic/semi": ["error", "always"],
			"@stylistic/arrow-parens": ["error", "as-needed"],
			"@stylistic/no-trailing-spaces": ["error", {"ignoreComments": true}],
			"@stylistic/comma-dangle": ["error", "always-multiline"],
		},
	},
	/**
	 * @type {import("eslint").Linter.Config}
	 */
	tseslintConfig = {
		...tseslint.plugin.rules,
		plugins: {
			// @ts-ignore
			"@typescript-eslint": tseslint.plugin,
		},
		rules: {
			"@typescript-eslint/no-unused-vars": "warn",
		},
	};

export default [
	// @ts-ignore
	...markdown.configs.recommended,
	includeIgnoreFile(path.resolve(__dirname, ".gitignore")),
	{
		files: ["**/*.ts"],
		languageOptions: {
			globals: {
				...globals.node,
			},
			parser: parser,
		},
		rules: {
			...stylisticConfig.rules,
			...tseslintConfig.rules,
		},
		plugins: {
			...stylisticConfig.plugins,
			...tseslintConfig.plugins,
		},
	},	{
		files: ["**/*.spec.ts"],
		languageOptions: {
			globals: {
				...globals.mocha,
				...globals.node,
			},
			parser: parser,
		},
		rules: {
			...tseslintConfig.rules,
			...stylisticConfig.rules,
			...mochaPlugin.configs.flat,
		},
		plugins: {
			...tseslintConfig.plugins,
			...stylisticConfig.plugins,
			...mochaPlugin.configs.flat,
		},
	}, 	{
		files: ["**/*.js", "**/*.mjs"],
		rules: {
			...jsdocConfig.rules,
			...stylisticConfig.rules,
			...js.configs.recommended.rules,
		},
		plugins: {
			...jsdocConfig.plugins,
			...stylisticConfig.plugins,
		},
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.worker,
			},
		},
	}, {
		files: ["**/*.cjs"],
		languageOptions: {
			globals: {
				...globals.node,
				...globals.browser,
			},
		},
		rules: {
			...js.configs.recommended.rules,
			...stylisticConfig.rules,
			...jsdocConfig.rules,
		},
		plugins: {
			...stylisticConfig.plugins,
			...jsdocConfig.plugins,
		},
	}, {
		language: "json/json",
		files: ["**/*.json"],
		rules: json.configs.recommended.rules,
		plugins: json.configs.recommended.plugins,
	},
	{
		files: ["**/*.css"],
		language: "css/css",
		// @ts-ignore
		...css.configs.recommended,
		plugins: {
			"css": css,
		},
		rules: {
			"css/no-invalid-properties": "warn",
		},
	},
];