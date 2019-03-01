import typescript from "rollup-plugin-typescript2"
import { version } from "../package.json"
const year = new Date().getFullYear()

const options = {
  plugins: [
    typescript({
      cacheRoot: "../node_modules/.cache",
      tsconfigDefaults: {
        compilerOptions: {
          removeComments: true
        }
      }
    })
  ]
}

export default [
  {
    input: "web/index.ts",
    output: {
      banner: `/*\nStrata ${version}\nCopyright © ${year} Basecamp, LLC\n */`,
      file: "web/dist/strata.js",
      format: "umd",
      name: "Strata",
      sourcemap: true
    },
    ...options
  }
]
