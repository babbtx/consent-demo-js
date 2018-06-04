import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import globals from "rollup-plugin-node-globals";

export default {
  input: "consent-demo.js",
  output: {
    file: "dist/consent-demo.js",
    format: "iife",
  },
  plugins: [
    resolve({ browser: true }),
    json(),
    commonjs(),
    babel({ exclude: ["node_modules/**"] }),
    globals()
  ]
}
