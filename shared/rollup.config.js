import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";
import { builtinModules } from "module";

const input = "src/index.ts";

/**
 * Create a base rollup config
 * @param {*} pkg Imported package.json
 * @returns {import('rollup').RollupOptions}
 */
export function createConfig(pkg) {
  const external = Object.keys(pkg.dependencies || {}).concat([
    ...builtinModules,
    "svelte/compiler",
  ]);

  return [
    {
      plugins: [esbuild()],
      input,
      external,
      output: [
        {
          format: "cjs",
          file: pkg.main,
          exports: "named",
          footer: "module.exports = Object.assign(exports.default, exports);",
          sourcemap: true,
        },
        {
          format: "esm",
          file: pkg.module,
          sourcemap: true,
        },
      ],
    },
    {
      plugins: [dts()],
      input,
      external,
      output: {
        file: pkg.types,
        format: "es",
      },
    },
  ];
}
