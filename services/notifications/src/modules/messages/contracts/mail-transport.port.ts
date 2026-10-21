/**
 * Stackra file contract:
 * Purpose: the MailTransport port: how a rendered mail leaves the process. A service-level port
 *          with two drivers.
 * Boundary: an abstract class that is its own DI token (ADR 0145): no `defineToken`, no interface.
 *           Drivers live in drivers/ and register with `@Driver(MailTransport, name)`; config
 *           `transport` picks one.
 * Runtime: node
 * Governing contract: ADR 0263, 0266 (memory driver first), 0142 (transport behind a port)
 */

/** A rendered mail ready to send. */
export interface OutboundMail {
  /** The verified recipient address, resolved at send time. */
  readonly to: string;
  /** The sender address. */
  readonly from: string;
  /** The rendered subject line. */
  readonly subject: string;
  /** The rendered HTML body. */
  readonly html: string;
  /** The rendered plain-text body. */
  readonly text: string;
}

/**
 * Sends one mail; returns the provider's id. Must be idempotent on `idempotencyKey` where the
 * provider supports it.
 */
export abstract class MailTransport {
  /**
   * Hands one mail to the provider, once per idempotency key.
   * @returns the provider's message id, used for bounce matching.
   */
  abstract send(mail: OutboundMail, idempotencyKey: string): Promise<string>;
}
