#!/usr/bin/env node

const esbuild = require("esbuild")
const package = require("../package.json")
const year = new Date().getFullYear()
const banner = `/*\nStrada ${package.version}\nCopyright © ${year} Basecamp, LLC\n*/`

const options = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  minify: true,
  banner: banner,
  outfile: "dist/strada.js",
}

esbuild.build(options).catch(() => process.exit(1))
