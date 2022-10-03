import { snapshot } from "uvu/assert";
import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";

export async function fileSnapshot(file, content) {
  const path = resolve(`test/snapshots/${file}.snap`);

  let fileContent;

  try {
    fileContent = await readFile(path, "utf-8");
  } catch (err) {
    await writeFile(path, content, "utf-8");
    console.info(`Created snapshot: "${path}"`);
    return;
  }

  snapshot(content, fileContent);
}
