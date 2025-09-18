import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.cjs",
      format: "cjs",
      sourcemap: true,
    },
    {
      file: "dist/index.mjs",
      format: "esm",
      sourcemap: true,
    },
  ],
  plugins: [
    nodeResolve(),
    commonjs(),
    // Compile TS → JS only (no declarations here)
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: false,
      declarationMap: false,
    }),
  ],
  external: [], // mark peer deps here if needed, e.g. ["react", "lodash"]
};
