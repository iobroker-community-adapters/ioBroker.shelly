const tsParser = require("@typescript-eslint/parser");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = [{
    ignores: [
        ".dev-server/**",
        "**/build/",
        "**/.prettierrc.js",
        "**/.eslintrc.js",
        "admin/words.js",
        "test/**",
        "eslint.config.cjs"
    ],
}, ...compat.extends("plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"), {
    plugins: {},

    languageOptions: {
        parser: tsParser,
        ecmaVersion: 2022,
        sourceType: "module",

        parserOptions: {
            project: "./tsconfig.json",
        },
    },

    rules: {
        "@typescript-eslint/no-parameter-properties": "off",
        "@typescript-eslint/no-explicit-any": "off",

        "@typescript-eslint/no-use-before-define": ["error", {
            functions: false,
            typedefs: false,
            classes: false,
        }],

        "@typescript-eslint/no-unused-vars": ["error", {
            ignoreRestSiblings: true,
            argsIgnorePattern: "^_",
        }],

        "@typescript-eslint/explicit-function-return-type": ["warn", {
            allowExpressions: true,
            allowTypedFunctionExpressions: true,
        }],

        "@typescript-eslint/no-object-literal-type-assertion": "off",
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-namespace": "off",
        "no-var": "error",
        "prefer-const": "error",
        "no-trailing-spaces": "error",
    },
}, {
    files: ["**/*.test.ts"],

    rules: {
        "@typescript-eslint/explicit-function-return-type": "off",
    },
}];