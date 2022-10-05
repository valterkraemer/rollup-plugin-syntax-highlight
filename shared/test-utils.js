import { snapshot } from "uvu/assert";
import { readFile, writeFile, mkdir } from "fs/promises";
import { resolve, dirname } from "path";

export async function fileSnapshot(name, content) {
  const fileName = name.replace(/[^a-zA-Z0-9]/g, "-");

  const path = resolve(`test/snapshots/${fileName}.snap`);

  let fileContent;

  try {
    fileContent = await readFile(path, "utf-8");
    snapshot(content, fileContent);
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }

  // file didn't exist

  try {
    await writeFile(path, content, "utf-8");
    console.info(`Created snapshot: "${path}"`);
    return;
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }

  // folder didn't exist

  const dir = dirname(path);

  await mkdir(dir);
  console.info(`Created directory: "${dir}"`);
  await writeFile(path, content, "utf-8");
  console.info(`Created snapshot: "${path}"`);
}

export async function generateDemoFile(path, outputs) {
  const texturesHtml = outputs
    .map(({ name, code, params }) => {
      const p = params ? `<code>${JSON.stringify(params)}</code>` : "";

      return `<h2>${name}</h2>` + p + code;
    })
    .join("\n\n");

  const html = `
<html>
    <body>
${texturesHtml}
    </body>
</html>`;

  await writeFile(path, html, {
    encoding: "utf-8",
  });

  console.log(`\n\nDemo file created at: ${path}\n`);
}
