import MagicString from "magic-string";
import { getHighlighter } from "shiki";
import { compile } from "svelte/compiler";

import {
  basePlugin,
  SyntaxHighlightOptions,
} from "../../../shared/base-plugin";

export type { SyntaxHighlightOptions } from "../../../shared/base-plugin";

enum FontStyle {
  NotSet = -1,
  None = 0,
  Italic = 1,
  Bold = 2,
  Underline = 4,
}

export type Options = {
  languages?: Record<string, string>;
  paramRegExp?: RegExp;
  theme?: string;
};

type Replacement = {
  start: number;
  length: number;
  end: number;
  param: string;
  value: string;
};

const paramRegExp = /\$\[(\w+)(?::(\w+))?\]/g; // matches $[export:exp]

export const syntaxHighlight = ({
  ssr,
  ...baseOptions
}: SyntaxHighlightOptions & {
  ssr?: boolean;
} = {}) => {
  const plugin = basePlugin(
    async ({ content, shikiOptions, language, loadOptions }) => {
      const highlighter = await getHighlighter(shikiOptions);

      const { replacements, transformedCode, params } =
        transformAndRetriveReplacements(content, paramRegExp);

      const lines = highlighter.codeToThemedTokens(
        transformedCode,
        language,
        undefined,
        {
          includeExplanation: false,
        }
      );

      const { fg, bg } = highlighter.getTheme();

      const s = new MagicString(content);

      s.prepend(`<pre style="background-color: ${bg}"><code>`);

      let replacement = replacements.shift();
      let index = 0;

      for (const line of lines) {
        s.appendLeft(index, `<span class="line">`);

        for (const token of line) {
          let styles = `color: ${token.color || fg}`;
          if (token.fontStyle !== undefined) {
            if (token.fontStyle & FontStyle.Italic) {
              styles += "; font-style: italic";
            }
            if (token.fontStyle & FontStyle.Bold) {
              styles += "; font-weight: bold";
            }
            if (token.fontStyle & FontStyle.Underline) {
              styles += "; text-decoration: underline";
            }
          }

          const tokenEnd = index + token.content.length;
          /** keeps track of length offset, becaues "#{count}".length > "count".length */
          let offset = 0;
          let currentStart = 0;
          let newContent = "";

          while (replacement && replacement.start < tokenEnd + offset) {
            const { start, param, value, length } = replacement;

            const beforeParam = token.content.slice(
              currentStart,
              start - index - offset
            );

            newContent +=
              escapeHtml(beforeParam) +
              `{#if $$slots["${param}"]}<slot name="${param}" />{:else}{${param}}{/if}`;

            currentStart += beforeParam.length + value.length;
            offset += length - value.length;

            replacement = replacements.shift();
          }

          newContent += escapeHtml(token.content.slice(currentStart));

          s.overwrite(
            index,
            tokenEnd + offset,
            `<span class="token" style="${styles}">${newContent}</span>`
          );

          index = tokenEnd + offset;
        }

        s.appendRight(index, `</span>`);

        index++; // newline
      }

      s.append(`</code></pre>`);

      if (params.length) {
        s.prepend(`
<script lang="ts">
${params
  .map(({ param, value }) => {
    return `	export let ${param} = "${value}";`;
  })
  .join("\n")}
</script>

`);
      }

      const {
        js: { code, map },
      } = compile(s.toString(), {
        generate: loadOptions?.ssr || ssr ? "ssr" : "dom",
        dev: process.env.NODE_ENV === "development",
        hydratable: true,
        css: false,
      });

      return { code, map };
    }
  );

  return plugin(baseOptions);
};

const htmlEscapes = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "{": "&#123;",
  "}": "&#125;",
};

function escapeHtml(html: string) {
  return html.replace(/[&<>"'{}]/g, (chr) => (htmlEscapes as any)[chr]);
}

function transformAndRetriveReplacements(code: string, regExp: RegExp) {
  const replacements: Replacement[] = [];

  // Transform "$[xyz]" to "xyz" but keep track of where they were
  const transformedCode = code.replace(regExp, (match, value, param, index) => {
    replacements.push({
      start: index,
      length: match.length,
      end: index + match.length,
      param: param || value.trim(),
      value,
    });

    return value;
  });

  const params = replacements.filter(
    ({ param }, index, array) =>
      array.findIndex((i) => i.param === param) === index
  );

  return { transformedCode, replacements, params };
}
