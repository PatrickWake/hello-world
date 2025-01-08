export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    ignores: ["node_modules/", ".next/", "build/"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
    },
  },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
];
