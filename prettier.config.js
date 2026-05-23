/** @type {import("prettier").Config} */
const config = {
  useTabs: false,
  tabWidth: 2,
  printWidth: 80,
  semi: true,
  singleQuote: true,
  jsxSingleQuote: true,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'auto',
  quoteProps: 'as-needed',
  trailingComma: 'all',
  singleAttributePerLine: false,
  plugins: ['prettier-plugin-tailwindcss'],
  bracketSameLine: false,
};

export default config;
