# rollup-plugin-syntax-highlight

Import code as syntax highlighted HTML using Rollup or Vite.

Works like the [Special Assets](https://vitejs.dev/guide/features.html#static-assets) loaders in Vite. By appending `?syntax` to the import path, you will import the file's content as highlighted HTML code.

Uses [Shiki](https://github.com/shikijs/shiki) for highlighting.

![Highlighted code rendered](/assets/rendered.png)

## Installation

```
npm i -D rollup-plugin-syntax-highlight
```

## Usage

Add to `plugins` in `rollup.config.js` or `vite.config.js`.

```js
import { syntaxHighlight } from "rollup-plugin-syntax-highlight";

export default {
  plugins: [syntaxHighlight()],
};
```

You can now import HTML with the highlighted code by appending `?syntax` to the path.

```js
import codeHtml from "./code-sample.ts?syntax";

export default `<html><body><h2>Code example</h2>${codeHtml}</body></html>`;
```

## Options

Same options as [`shiki.getHighlighter`](https://shiki.matsu.io).

```js
syntaxHighlight({
  theme: "code-dark",
});
```

In addition, it supports the option `mapExtension`. I allows you to specify formatting for extensions Shiki doesn't recognise.

```js
syntaxHighlight({
  mapExtension: {
    svg: "xml",
  },
});
```
