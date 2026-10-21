/**
 * Stackra file contract:
 * Purpose: `@AccessLogged({ classification, subjects })`: marks a method whose every call is
 *          written to the access log.
 * Boundary: the decorator annotates; it stores its options under the metadata key `createDecorator`
 *           registers for the Explorer and nothing else. Registration happens in the Explorer at
 *           bootstrap, never at import time. Legacy decorators over the container's WeakMap store
 *           (ADR 0005); no reflect-metadata. Its type is `AccessLoggedDecorator`, generic over the
 *           method's own argument list. `decorators/` appears with its second file; the catalogue
 *           shows the folder.
 * Runtime: isomorphic
 * Governing contract: ADR 0117 C2 (a package owns its decorators), ADR 0144 (Explorers)
 */
import { createDecorator } from "@stackra/container";
import type { AccessLoggedDecorator } from "#core/interfaces/access-logged-decorator.interface";
import type { AccessLoggedOptions } from "#core/interfaces/access-logged-options.interface";

/**
 * Marks a provider method. The method's arguments are passed to `subjects` to extract record ids.
 * The decorator is its own metadata key: the Explorer asks `discovery.methodsWith(AccessLogged)`
 * and gen discovers it by `kind`. No `schema`: the options hold a function, which gen checks by
 * type, not at run time.
 *
 * @example
 * @AccessLogged({ classification: DataClassification.Personal, subjects: (id: string) => [id] })
 * async view(id: string): Promise<CustomerView> { … }
 */
export const AccessLogged = createDecorator<AccessLoggedOptions<never[]>>({
  kind: "access_logged",
  target: "method",
}) as unknown as AccessLoggedDecorator; // typed per call site; the runtime value is unchanged
