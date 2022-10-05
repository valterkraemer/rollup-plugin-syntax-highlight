import { test } from "uvu";
import { resolve } from "path";

import { rollup } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { syntaxHighlight } from "../dist/index.mjs";
import { fileSnapshot, generateDemoFile } from "../../../shared/test-utils.js";

const outputs = [];

function testFixture(testName, { input, params }) {
  test(testName, async () => {
    const bundle = await rollup({
      input: resolve(`test/fixtures/${input}`),
      plugins: [
        syntaxHighlight({
          theme: "dark-plus",
          ssr: true,
        }),
        nodeResolve(),
      ],
    });

    const { output } = await bundle.generate({
      format: "iife",
      name: "App",
    });

    const { render } = eval(output[0].code + "App");
    const { html } = render(params);

    await fileSnapshot(testName, html);

    outputs.push({ name: testName, code: html, params });
  });
}

testFixture("css", {
  input: "css.css?syntax",
});
testFixture("css with params", {
  input: "css-params.css?syntax",
  params: {
    color: "blue",
  },
});

testFixture("html", {
  input: "html.html?syntax",
});
testFixture("html with params - use default", {
  input: "html-params.html?syntax",
});
testFixture("html with params", {
  input: "html-params.html?syntax",
  params: { className: "heading" },
});

testFixture("js", {
  input: "js.js?syntax",
});
testFixture("js with params", {
  input: "js-params.js?syntax",
  params: { constName: "myFunction" },
});

testFixture("rs", {
  input: "rs.rs?syntax",
});
testFixture("rs with params", {
  input: "rs-params.rs?syntax",
  params: { fnName: "say_hello" },
});

testFixture("svelte", {
  input: "svelte.svelte?syntax",
});
testFixture("svelte with params", {
  input: "svelte-params.svelte?syntax",
  params: { count: "amount" },
});

testFixture("svg", {
  input: "svg.svg?syntax",
});
testFixture("svg with params", {
  input: "svg-params.svg?syntax",
  params: { r: "10" },
});

testFixture("ts", {
  input: "ts.ts?syntax",
});
testFixture("ts with params", {
  input: "ts-params.ts?syntax",
  params: { fnName: "sayHello" },
});

testFixture("param alias", {
  input: "param-alias.html?syntax",
  params: { tag: "p" },
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
