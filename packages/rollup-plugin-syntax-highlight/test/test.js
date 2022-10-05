import { test } from "uvu";
import { resolve } from "path";

import { rollup } from "rollup";
import { syntaxHighlight } from "../dist/index.mjs";
import { fileSnapshot, generateDemoFile } from "../../../shared/test-utils.js";

const outputs = [];

function testFixture(testName, { input }) {
  test(testName, async () => {
    const bundle = await rollup({
      input: resolve(`test/fixtures/${input}`),
      plugins: [
        syntaxHighlight({
          theme: "dark-plus",
        }),
      ],
    });

    const { output } = await bundle.generate({
      format: "iife",
      name: "App",
    });

    const html = eval(output[0].code + "App");

    await fileSnapshot(testName, html);

    outputs.push({ name: testName, code: html });
  });
}

testFixture("css", {
  input: "css.css?syntax",
});

testFixture("html", {
  input: "html.html?syntax",
});

testFixture("js", {
  input: "js.js?syntax",
});

testFixture("rs", {
  input: "rs.rs?syntax",
});

testFixture("svelte", {
  input: "svelte.svelte?syntax",
});

testFixture("svg", {
  input: "svg.svg?syntax",
});

testFixture("ts", {
  input: "ts.ts?syntax",
});

testFixture("using '.syntax' extension", {
  input: "syntax-extension.js.syntax",
});

testFixture("using '.syntax?syntax'", {
  input: "syntax-extension.js.syntax?syntax",
});

test.after(async () => {
  await generateDemoFile(resolve("test/demo.html"), outputs);
});

test.run();
