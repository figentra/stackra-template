/**
 * Stackra file contract:
 * Purpose: deploy-time configuration of the commerce service; read by operators, applied by a
 *          restart.
 * Boundary: `Config({ schema, env })`: the shape is CommerceOptions (src/schemas/), `env` maps a
 *           field to the environment variable that sets it, and the class is the DI token. The key
 *           is derived from the file (`commerce`, the member key); a second class deriving the same
 *           key fails gen. Never per tenant (that is settings). Layers, lowest first: the schema's
 *           defaults, the `env` variables, then runway.yaml `environments.<env>.config.commerce`. A
 *           required field with no value in some environment fails `stackra validate`; a missing
 *           secret fails the boot.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 6, 19 and 20, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0146 (config layers), ADR 0173 (secrets), ADR 0296
 *                     (runway config values)
 */
import { Config } from "@stackra/config";
import { CommerceOptions } from "#src/schemas/commerce-options.schema";

/** Injected by type: `constructor(private readonly config: CommerceConfig)`. */
export class CommerceConfig extends Config({
  schema: CommerceOptions,
  env: { storefrontBaseUrl: "STACKRA_STOREFRONT_BASE_URL" },
}) {}
