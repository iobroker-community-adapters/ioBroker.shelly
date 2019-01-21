'use strict';

module.exports = {
    'extends': ['eslint:recommended', 'plugin:react/recommended'],
    'parserOptions': {
        'ecmaVersion': 8,
        'ecmaFeatures': {
            'experimentalObjectRestSpread': true,
            'jsx': true
        },
        'sourceType': 'module'
    },
    'env': {
        'node': true,
        'es6': true
    },
    'rules': {
        'no-console': ['warn'],
        'no-undef': ['error'],
        'no-unused-vars': ['warn'],
        'one-var': 'off',
        'arrow-parens': ['error', 'always'],
        'semi': ['error', 'always'],
        'indent': ['error', 2, {
            'SwitchCase': 1
        }],
        'max-len': [
            'warn',
            {
                'code': 200,
                'ignoreTemplateLiterals': true,
                'ignoreStrings': true
            }
        ],
        'generator-star-spacing': 'off',
        'func-names': ['error', 'never'],
        'quotes': ['error', 'single']
    }
}
