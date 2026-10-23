/**
 * Stackra file contract:
 * Purpose: the console's one error state for a failed query or action inside a page: maps a refusal
 *          envelope to a title, a line and a retry.
 * Boundary: presentation over the error envelope of ADR 0140: the refusal's `kind` picks the
 *           message key, the `code` is shown as a reference, and the details are never rendered
 *           (they may hold server state). Unknown errors fall back to one generic message; the raw
 *           error goes to the reporter, not the screen. A caller that already knows the kind passes
 *           it, and such an error is not reported. Route errors are not this component's:
 *           `@stackra/navigation` owns the root boundary. A class component; gen compiles it to a
 *           function component.
 * Runtime: browser
 * Governing contract: ADR 0140 (error envelope), ADR 0232 (@stackra/errors reporter), ADR 0294 (as
 *                     amended by programming model v3.1, AGENTS.md: class components)
 */
import { useEffect } from "react";
import { ErrorKind, isRefusal } from "@stackra/errors";
import { useErrorReporter } from "@stackra/errors/react";
import { useTranslation } from "@stackra/i18n/react";
import { Alert, Button } from "@stackra/ui/react";
import { Component } from "#stackra/ui";
import { I18n } from "#stackra/i18n";
import type { ErrorStateProps } from "./error-state.props";

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
export class ErrorState extends Component<ErrorStateProps> {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** Sends an unexpected error to the errors package's reporter port. */
  report = useErrorReporter();

  /** The error as a refusal, or `null` when it is anything else. */
  get refusal() {
    return isRefusal(this.props.error) ? this.props.error : null;
  }

  /** The kind the caller passed, else the refusal's; undefined for an unexpected error. */
  get kind() {
    return this.props.kind ?? this.refusal?.kind;
  }

  /** The title and body keys for the kind. */
  get message() {
    return (this.kind && MESSAGES.get(this.kind)) ?? I18n.console.errors.unknown;
  }

  /** Whether a retry could change the answer. */
  get isRetryable() {
    return !this.kind || !NO_RETRY.has(this.kind);
  }

  /** The alert; an unexpected error is reported once, after commit, never during render. */
  render() {
    const { error, kind, onRetry } = this.props;
    // reporting during render would repeat on every re-render and twice under Strict Mode
    useEffect(() => {
      if (!kind && !isRefusal(error)) this.report(error);
    }, [error, kind, this.report]);

    return (
      <Alert status="danger" role="alert">
        <Alert.Title>{this.i18n.t(this.message.title)}</Alert.Title>
        <Alert.Description>
          {this.i18n.t(this.message.body)}
          {this.refusal && <code className="ms-2 text-xs">{this.refusal.code}</code>}
        </Alert.Description>
        {onRetry && this.isRetryable && (
          <Alert.Actions>
            <Button size="sm" variant="secondary" onPress={onRetry}>
              {this.i18n.t(I18n.console.errors.retry)}
            </Button>
          </Alert.Actions>
        )}
      </Alert>
    );
  }
}
