import { getHighlighter } from "shiki";

import { basePlugin } from "../../../shared/base-plugin";

export type { SyntaxHighlightOptions } from "../../../shared/base-plugin";

export const syntaxHighlight = basePlugin(
  async ({ content, shikiOptions, language }) => {
    const highlighter = await getHighlighter(shikiOptions);
    const code = highlighter.codeToHtml(content, { lang: language });

    return {
      code: `export default ${JSON.stringify(code)}`,
    };
  }
);
