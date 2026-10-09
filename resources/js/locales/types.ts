import type zhCN from './zh-CN';

/**
 * The Chinese bundle is the source of truth for the key shape.
 *
 * `en.ts` is typed as this, so a key added to one language and not the other
 * fails `tsc` (missing leaf) or trips an excess-property error (extra key).
 * That is the whole parity mechanism — deliberately no runtime check.
 *
 * Do NOT add `as const` to the locale files: the leaves must widen to `string`
 * for this structural check to work, and `as const` would force `en` to
 * duplicate the Chinese literals verbatim.
 */
export type Translations = typeof zhCN;
