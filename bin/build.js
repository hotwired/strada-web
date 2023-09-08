#!/usr/bin/env node

const esbuild = require("esbuild")
const package = require("../package.json")
const year = new Date().getFullYear()
const banner = `/*\nStrada ${package.version}\nCopyright © ${year} 37signals, LLC\n*/`

const options = {
  entryPoints: ["src/index.js"],
  bundle: true,
  minify: false,
  banner: { js: banner },
  format: 'esm',
  outfile: "dist/strada.js",
}

esbuild.build(options).catch(() => process.exit(1))
