import { test } from "uvu";
import { resolve } from "path";

import { rollup } from "rollup";
import { syntaxHighlight } from "../dist/index.mjs";
import { fileSnapshot } from "./utils.js";
import { writeFile } from "fs/promises";

const outputs = [];

async function testFixture(fixture) {
  const bundle = await rollup({
    input: resolve(`test/fixtures/${fixture}?syntax`),
    plugins: [syntaxHighlight()],
  });

  const { output } = await bundle.generate({
    file: "file.js",
  });

  const code = output[0].code;

  await fileSnapshot(fixture, code);

  outputs.push({ name: fixture, code });
}

test("css", async () => {
  await testFixture("test.css");
});

test("html", async () => {
  await testFixture("test.html");
});

test("js", async () => {
  await testFixture("test.js");
});

test("rs", async () => {
  await testFixture("test.rs");
});

test("svelte", async () => {
  await testFixture("test.svelte");
});

test("svg", async () => {
  await testFixture("test.svg");
});

test("ts", async () => {
  await testFixture("test.ts");
});

test.after(async () => {
  const texturesHtml = outputs
    .map(({ name, code }) => {
      const start = code.indexOf('"<pre');
      const end = code.lastIndexOf('/pre>"') + 6;
      const html = JSON.parse(code.slice(start, end));

      return `<h2>${name}</h2>\n` + html;
    })
    .join("\n\n");

  // for creating demo.html

  const html = `
<html>
    <body>
${texturesHtml}
    </body>
</html>`;

  await writeFile("test/demo.html", html, {
    encoding: "utf-8",
  });
});

test.run();
