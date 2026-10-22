/**
 * Stackra file contract:
 * Purpose: renders a tenant's brand tokens as one CSS rule, so a server can inline `<style>` after
 *          the stylesheet.
 * Boundary: a pure string function with no React and no I/O. Its output is inlined into HTML, so
 *           it trusts nothing: every key must be a token this package declares, and every value
 *           must match the token value grammar (colours, lengths, numbers and font stacks), which
 *           has no character that can end a declaration, a rule, a comment or the `<style>`
 *           element. Anything else throws, so a bad tenant value fails loudly instead of reaching a
 *           page. The rule applies in light and dark, because a tenant override has one value.
 * Runtime: isomorphic
 * Governing contract: ADR 0231 (design tokens: dotted and custom-property forms), ADR 0127
 *                     (categories)
 */
import { COLOR_TOKENS } from "#core/design-tokens/color.design-token";
import { FONT_TOKENS } from "#core/design-tokens/font.design-token";
import { RADIUS_TOKENS } from "#core/design-tokens/radius.design-token";
import { brandVariableName } from "#core/functions/brand-variable-name.function";
import type { BrandToken, BrandTokens } from "#core/types/brand-tokens.type";

/** Every key a tenant may override. */
const KNOWN_TOKENS: ReadonlySet<string> = new Set([
  ...Object.keys(COLOR_TOKENS),
  ...Object.keys(RADIUS_TOKENS),
  ...Object.keys(FONT_TOKENS),
]);

/**
 * The token value grammar: letters, digits, spaces, `#`, `%`, `.`, `,`, `+`, `-`, `/`, `_`,
 * parentheses and quotes, so `oklch(55% 0.17 262)`, `#2f6df6`, `0.5rem` and `"Geist", sans-serif`
 * pass while `;`, `{`, `}`, `<`, `>`, `\`, `@`, `!` and line breaks never do.
 */
const VALUE_GRAMMAR = /^[\w #%.,+\-/()"']{1,200}$/;

/** Grammar-legal text that would still open a comment or load a resource, so it is refused too. */
const FORBIDDEN_CONSTRUCTS = /\/\*|\burl\s*\(|\bimage-set\s*\(|\bexpression\s*\(/i;

/**
 * Whether a value is safe to place in a declaration: it matches the grammar, holds no forbidden
 * construct, and its quotes and parentheses are balanced.
 */
function isSafeValue(value: string): boolean {
  if (!VALUE_GRAMMAR.test(value) || FORBIDDEN_CONSTRUCTS.test(value)) return false;
  if ((value.split('"').length - 1) % 2 !== 0 || (value.split("'").length - 1) % 2 !== 0) {
    return false;
  }
  let depth = 0;
  for (const char of value) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (depth < 0) return false;
  }
  return depth === 0;
}

/**
 * Renders a tenant's brand overrides as one CSS rule.
 * @param tokens - the tokens a tenant overrides; an empty object renders an empty rule.
 * @returns `:root, .light, .dark { --brand-…: …; }`.
 * @throws RangeError naming the token when a key is not a declared token or a value is outside the
 *   token value grammar.
 * @example
 * brandCssVariables({ "color.accent": "oklch(60% 0.2 30)" });
 */
export function brandCssVariables(tokens: Partial<BrandTokens>): string {
  const declarations = (Object.entries(tokens) as [BrandToken, string][])
    .map(([token, value]) => {
      if (!KNOWN_TOKENS.has(token)) throw new RangeError(`Unknown brand token "${token}".`);
      if (typeof value !== "string" || !isSafeValue(value)) {
        throw new RangeError(`Brand token "${token}" has a value outside the token grammar.`);
      }
      return `${brandVariableName(token)}: ${value};`;
    })
    .join(" ");
  return `:root, .light, .dark { ${declarations} }`;
}
