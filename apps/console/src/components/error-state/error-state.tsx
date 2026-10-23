/**
 * Stackra file contract:
 * Purpose: the console's one error state: maps a refusal envelope to a title, a line and a retry.
 * Boundary: presentation over the error envelope of ADR 0140: the refusal's `kind` picks the
 *           message key, the `code` is shown as a reference, and the details are never rendered
 *           (they may hold server state). Unknown errors fall back to one generic message; the raw
 *           error goes to the reporter, not the screen. A caller that already knows the kind (the
 *           root boundary's 404) passes it, and such an error is not reported.
 * Runtime: browser
 * Governing contract: ADR 0140 (error envelope), ADR 0232 (@stackra/errors reporter), ADR 0294
 *                     (decision 14)
 */
import { useEffect } from "react";
import { ErrorKind, isRefusal } from "@stackra/errors";
import { useErrorReporter } from "@stackra/errors/react";
import { useTranslation } from "@stackra/i18n/react";
import { Alert, Button } from "@stackra/ui";
import { I18n } from "#stackra/i18n";

/** What an error state needs. */
export interface ErrorStateProps {
  /** Whatever was thrown; a refusal renders by kind, anything else as `unknown`. */
  readonly error: unknown;
  /** The kind when the caller knows it without a refusal (a router 404); wins over the error's. */
  readonly kind?: ErrorKind;
  /** Called by the retry button; absent means no button (for example, a 403). */
  readonly onRetry?: () => void;
}

/** Kinds that get no retry button because retrying cannot change the answer. */
const NO_RETRY: ReadonlySet<ErrorKind> = new Set([
  ErrorKind.Forbidden,
  ErrorKind.NotFound,
  ErrorKind.Validation,
  ErrorKind.EntitlementRequired,
]);

/** Kinds with their own message; any other kind, and anything but a refusal, is `unknown`. */
const MESSAGES = new Map([
  [ErrorKind.NotFound, I18n.console.errors.not_found],
  [ErrorKind.Forbidden, I18n.console.errors.forbidden],
  [ErrorKind.Unavailable, I18n.console.errors.unavailable],
  [ErrorKind.Validation, I18n.console.errors.validation],
  [ErrorKind.EntitlementRequired, I18n.console.errors.entitlement_required],
]);

/** An alert with a translated message per kind and the refusal code for support. */
export function ErrorState({ error, kind, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();
  const report = useErrorReporter();
  const refusal = isRefusal(error) ? error : null;
  const resolved = kind ?? refusal?.kind;
  const message = (resolved && MESSAGES.get(resolved)) ?? I18n.console.errors.unknown;
  const retryable = !resolved || !NO_RETRY.has(resolved);
  // An unexpected error goes to the reporter once, after commit; the user sees the generic text.
  // Reporting during render would repeat on every re-render and twice under Strict Mode.
  useEffect(() => {
    if (!kind && !isRefusal(error)) report(error);
  }, [error, kind, report]);

  return (
    <Alert status="danger" role="alert">
      <Alert.Title>{t(message.title)}</Alert.Title>
      <Alert.Description>
        {t(message.body)}
        {refusal && <code className="ms-2 text-xs">{refusal.code}</code>}
      </Alert.Description>
      {onRetry && retryable && (
        <Alert.Actions>
          <Button size="sm" variant="secondary" onPress={onRetry}>
            {t(I18n.console.errors.retry)}
          </Button>
        </Alert.Actions>
      )}
    </Alert>
  );
}
