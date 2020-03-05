const OFF = 0;
const ERROR = 2;

module.exports = {
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  parser: "@typescript-eslint/parser",
  rules: {
    "@typescript-eslint/explicit-function-return-type": OFF,
    "no-console": ERROR,
    "prettier/prettier": [ERROR, { singleQuote: true, printWidth: 100 }]
  }
};
