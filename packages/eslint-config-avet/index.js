"use strict";

const style = require("./lib/style");

module.exports = {
  parser: "babel-eslint",
  extends: ["airbnb", "prettier", "prettier/react"],
  env: {
    browser: true,
    node: true,
    es6: true,
    mocha: true,
    jest: true,
    jasmine: true
  },
  rules: Object.assign(
    {},
    {
      quotes: ["error", "single"],
      "import/no-extraneous-dependencies": [0],
      "import/no-unresolved": [0],
      "import/extensions": [0],
      "import/no-dynamic-require": [0],
      "react/jsx-filename-extension": [0],
      "generator-star-spacing": [0],
      "consistent-return": [0],
      "react/forbid-prop-types": [0],
      "react/jsx-filename-extension": [1, { extensions: [".js"] }],
      "react/jsx-curly-brace-presence": [0],
      "global-require": [1],
      "import/prefer-default-export": [0],
      "react/jsx-no-bind": [0],
      "react/prop-types": [0],
      "react/prefer-stateless-function": [0],
      "no-else-return": [0],
      "no-restricted-syntax": [0],
      "import/no-extraneous-dependencies": [0],
      "no-use-before-define": [0],
      "jsx-a11y/no-static-element-interactions": [0],
      "jsx-a11y/no-noninteractive-element-interactions": [0],
      "jsx-a11y/click-events-have-key-events": [0],
      "jsx-a11y/anchor-is-valid": [0],
      "jsx-a11y/href-no-hash": [0],
      "jsx-a11y/anchor-is-valid": ["warn", { aspects: ["invalidHref"] }],
      "no-nested-ternary": [0],
      "arrow-body-style": [0],
      "import/extensions": [0],
      "no-bitwise": [0],
      "no-cond-assign": [0],
      "no-shadow": [0],
      "no-param-reassign": [0],
      "import/no-unresolved": [0],
      "comma-dangle": [
        "error",
        {
          arrays: "always-multiline",
          objects: "always-multiline",
          imports: "always-multiline",
          exports: "always-multiline",
          functions: "ignore"
        }
      ],
      "object-curly-newline": [0],
      "function-paren-newline": [0],
      "no-restricted-globals": [0],
      "require-yield": [1],
      "no-script-url": [0],
      "class-methods-use-this": [0],
      "no-await-in-loop": [0],
      "guard-for-in": [0],
      "no-multi-assign": [0],
      "global-require": [0],
      "no-bitwise": [0],
      "import/first": [0],
      "import/no-mutable-exports": [0],
      "import/no-named-as-default": [0],
      "react/require-default-props": [0],
      "react/no-multi-comp": [0],
      "react/no-array-index-key": [0],
      "react/no-unused-state": [0],
      "react/react-in-jsx-scope": [0],
      "no-param-reassign": [0]
    },
    style.rules
  ),
  parserOptions: {
    ecmaFeatures: {
      experimentalObjectRestSpread: true
    }
  }
};
