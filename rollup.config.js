import typescript from "rollup-plugin-typescript2"
import { version } from "./package.json"
const year = new Date().getFullYear()

const options = {
  plugins: [
    typescript({
      cacheRoot: "node_modules/.cache",
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
    input: "src/index.ts",
    output: {
      banner: `/*\nStrada ${version}\nCopyright © ${year} Basecamp, LLC\n */`,
      file: "dist/strada.js",
      format: "umd",
      name: "Strada",
      sourcemap: true
    },
    ...options
  }
]
