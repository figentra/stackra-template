/**
 * Stackra file contract:
 * Purpose: the console's one error state: maps a typed error envelope to a title, a line and a
 *          retry.
 * Boundary: presentation over the error envelope of ADR 0140: the `category` picks the message key,
 *           the `code` is shown as a reference, and the `details` are never rendered (they may hold
 *           server state). Unknown errors fall back to one generic message; the raw error goes to
 *           the reporter, not the screen.
 * Runtime: browser
 * Governing contract: ADR 0140 (error envelope), ADR 0232 (@stackra/errors reporter), ADR 0128
 */
import { useEffect } from "react";
import { Alert, Button } from "@stackra/ui";
import { useTranslation } from "@stackra/i18n/react";
import { ErrorCategory } from "@stackra/errors";
import { isAppError, useErrorReporter } from "@stackra/errors/react";
import { I18n } from "#stackra/i18n";

/** What an error state needs. */
export interface ErrorStateProps {
  /** Whatever was thrown; an `AppError` renders by category, anything else as `unknown`. */
  readonly error: unknown;
  /** Called by the retry button; absent means no button (for example, a 403). */
  readonly onRetry?: () => void;
}

/** Categories that do not get a retry button because retrying cannot change the answer. */
const NO_RETRY: ReadonlySet<ErrorCategory> = new Set([
  ErrorCategory.Forbidden,
  ErrorCategory.NotFound,
  ErrorCategory.Validation,
  ErrorCategory.EntitlementRequired,
]);

/**
 * Categories with their own message; every other category, and anything that is not an envelope, is
 * `unknown`.
 */
const MESSAGES = new Map([
  [ErrorCategory.NotFound, I18n.console.errors.not_found],
  [ErrorCategory.Forbidden, I18n.console.errors.forbidden],
  [ErrorCategory.Unavailable, I18n.console.errors.unavailable],
  [ErrorCategory.Validation, I18n.console.errors.validation],
  [ErrorCategory.EntitlementRequired, I18n.console.errors.entitlement_required],
]);

/** An alert with a translated message per category and the error code for support. */
export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();
  const report = useErrorReporter();
  const envelope = isAppError(error) ? error : null;
  const message = (envelope && MESSAGES.get(envelope.category)) ?? I18n.console.errors.unknown;
  const retryable = !envelope || !NO_RETRY.has(envelope.category);
  // An unexpected error goes to the reporter once, after commit; the user sees the generic text.
  // Reporting during render would repeat on every re-render and twice under Strict Mode.
  useEffect(() => {
    if (!isAppError(error)) report(error);
  }, [error, report]);

  return (
    <Alert status="danger" role="alert">
      <Alert.Title>{t(message.title)}</Alert.Title>
      <Alert.Description>
        {t(message.body)}
        {envelope && <code className="ms-2 text-xs">{envelope.code}</code>}
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
