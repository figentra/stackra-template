/**
 * Stackra file contract:
 * Purpose: the props of the screen state block: one of loading, empty or error, told apart by
 *          `kind`.
 * Boundary: a type only, beside the component it types; re-exported by the folder's `index.ts`. A
 *           union, so a type alias rather than an interface; keys are typed `I18nKey`s, never raw
 *           strings.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14, as amended by programming model v3.1, AGENTS.md: Props
 *                     in their own file), ADR 0140
 */
import type { ClientError } from "@stackra/clients";
import type { I18nKey } from "#stackra/i18n";

/** Props of `ScreenState`. */
export type ScreenStateProps =
  | {
      /** Skeleton rows while the first page loads; never shown on a refetch (the data stays). */
      readonly kind: "loading";
      /**
       * How many rows to sketch.
       *
       * @defaultValue 3
       */
      readonly rows?: number;
    }
  | {
      /** Nothing to show; `title` and `hint` are typed keys. */
      readonly kind: "empty";
      /** The headline of the empty state. */
      readonly title: I18nKey;
      /** The line under it, saying what to do next. */
      readonly hint?: I18nKey;
    }
  | {
      /** A failed read; the envelope's refusal picks the message when the module ships one. */
      readonly kind: "error";
      /** The failure the client raised. */
      readonly error: ClientError;
      /** Retries the read. */
      readonly onRetry: () => void;
    };
