/**
 * Stackra file contract:
 * Purpose: `@AccessLogged({ classification, subjects })`: the class facet whose every call to a
 *          declared method is written to the access log.
 * Boundary: the decorator annotates and nothing else: `createDecorator` stores the options under
 *           the decorator itself, which is the key the Explorer and gen look up. It is registered
 *           for the kinds it may mark (actions, queries and services), so the facet-target lint
 *           refuses it anywhere else. Wrapping happens in AccessLogExplorer at bootstrap, never at
 *           import time; no reflect-metadata.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 6), ADR 0144 (Explorers), ADR 0117 C2 (a package owns
 *                     its decorators)
 */
import { createDecorator } from "@stackra/container";
import type { AccessLoggedOptions } from "#contracts/types/access-logged-options.type";

/**
 * Marks a class whose declared methods expose classified data. On an action it logs each `handle`
 * call against the principal the call is for; on a service with `subjects: "customerId"` it logs
 * each call against the `customerId` of the records it handles.
 *
 * @example
 * ```ts
 * @AccessLogged({ classification: DataClassification.Personal, subjects: "customerId" })
 * export class CustomerService extends CrudService<Customer> { … }
 * ```
 */
export const AccessLogged = createDecorator<AccessLoggedOptions>({
  kind: "access_logged",
  target: "class",
  kinds: ["action", "query", "service"],
});
