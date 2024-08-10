import fs from "fs";
import esbuild from "esbuild";

console.info("Beginning build");

async function buildService(name, entryPoint, outFile) {
  console.info(`[${name}] Beginning esbuild`);
  const start = Date.now();

  try {
    const buildOutput = await esbuild.build({
      entryPoints: [entryPoint],
      metafile: true,
      bundle: true,
      format: "esm",
      platform: "node",
      target: "node18",
      outfile: outFile,
      sourcemap: "inline",
      logLevel: "info",
      sourcesContent: false,
      // see https://github.com/evanw/esbuild/issues/1921
      banner: {
        js: `
        import { fileURLToPath } from 'url';
        import { createRequire as topLevelCreateRequire } from 'module';
        import path from 'path';
        const require = topLevelCreateRequire(import.meta.url);
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        `,
      },
    });

    if (buildOutput.metafile) {
      fs.writeFileSync(`dist/${name}-metafile.json`, JSON.stringify(buildOutput.metafile), "utf-8");
    }
    const end = Date.now();
    console.info(`[${name}] Completed esbuild (${end - start}ms)`);
  } catch (e) {
    console.error(`[${name}] Failed to build service`);
    console.error(e);
    process.exit(1);
  }
}

(async function () {
  await buildService("service", "src/index.ts", "dist/app.mjs");
  await buildService("slack-refresher", "src/slack-refresher/handler.ts", "dist/slack-refresher.mjs");
})();
