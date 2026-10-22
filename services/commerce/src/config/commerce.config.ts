/**
 * Stackra file contract:
 * Purpose: deploy-time configuration of the commerce service; read by operators, applied by a
 *          restart.
 * Boundary: a config class: types come from the property declarations, validation from the field
 *           decorators (Zod is the engine inside @stackra/validation and never visible here). Never
 *           per tenant (that is settings). Secrets are references resolved blind by the runtime
 *           secret store. No driver choice here: the mail driver is `MailConfig.driver`, set per
 *           environment by runway `drivers.mail` (ADR 0266).
 * Runtime: node
 * Governing contract: ADR 0146 (config layers), ADR 0173 (secrets), ADR 0095 (field rules), v2
 *                     guides/programming-model.mdx#config-files, ADR 0266
 */
import { Config, Env, Secret } from "@stackra/config";
import { Int, Str, Url } from "@stackra/validation";

/**
 * Injected by type (no `@Inject`): `constructor(private readonly config: CommerceConfig)`. Layers,
 * lowest first: these defaults → environment (`@Env`) → runway.yaml
 * `environments.<env>.config["commerce.service"]`. Validated at gen and at boot; a required field
 * with no value in some environment fails `stackra validate`, a missing secret fails the boot.
 */
@Config("commerce.service")
export class CommerceConfig {
  /**
   * Minutes an order may stay pending before expiry; tenants may lower it in settings, never
   * raise it.
   * @defaultValue 60
   */
  @Int({ min: 5 }) maxPendingMinutes = 60;
  /**
   * ISO 4217 code used when a market does not name one.
   * @defaultValue "USD"
   */
  @Str({ length: 3 }) defaultCurrency = "USD";
  /**
   * Base URL the confirmation mail links to (`<base>/orders/<id>`). Required, no default: the
   * value is set per environment in runway.yaml.
   */
  @Url() @Env("STACKRA_STOREFRONT_BASE_URL") storefrontBaseUrl!: string;
  /** API key the pricing client's RPC driver presents; a reference, resolved blind. Required. */
  @Secret("PRICING_API_KEY") pricingApiKey!: string;
}
