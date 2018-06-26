import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import ejs from "rollup-plugin-ejs";
import sass from "rollup-plugin-sass";
import globals from "rollup-plugin-node-globals";

export default {
  input: "consent-demo.js",
  output: {
    file: "dist/consent-demo.js",
    format: "iife",
  },
  plugins: [
    sass({ output: true }),
    resolve({ browser: true }),
    json(),
    ejs({ compilerOptions: { strict: true, _with: false, client: true } }),
    commonjs(),
    babel({ exclude: ["node_modules/**"] }),
    globals()
  ]
}
