/**
 * Stackra file contract:
 * Purpose: one fact: how the binary is identified and what the store policy is. Name, slug, scheme,
 *          store identifiers, the runtime policy and the minimum-version gate.
 * Boundary: EAS profiles, channels per environment and credentials are `runway.yaml`; the OTA
 *           rollout is the root runway's `targets.eas`; the toolchain is `mise.toml`; the EAS
 *           project id is the public env. Store releases are bi-weekly and phased (ADR 0180), a
 *           policy with no alternative, so it has no field. Changing `ios.bundleIdentifier` or
 *           `android.package` after the first store upload is refused by gen unless an ADR is
 *           named. `runtimePolicy`, `appVersionSource` and `orientation` are tool-owned Expo and
 *           EAS values.
 * Runtime: isomorphic
 * Governing contract: ADR 0180
 */
import { Config } from "@stackra/config";
import { Bool, Int, Nested, OneOf, Str } from "@stackra/validation";

/** iOS identity and capabilities gen writes into the Expo config. */
class IosConfig {
  /** The App Store bundle id; frozen after the first upload. */
  @Str() bundleIdentifier = "com.figentra.stackra";
  /** Ship an iPad layout. @defaultValue true */
  @Bool() supportsTablet = true;
  /** Export compliance: the app uses only exempt encryption. @defaultValue false */
  @Bool() usesNonExemptEncryption = false;
}

/** Android identity gen writes into the Expo config. */
class AndroidConfig {
  /** The Play Store package name; frozen after the first upload. */
  @Str() package = "com.figentra.stackra";
  /** Opt in to Android's predictive back gesture. @defaultValue false */
  @Bool() predictiveBackGesture = false;
}

/** One runtime policy, never mixed; `appVersionSource: "remote"` lets EAS own the build number. */
@Config("mobile.release")
export class ReleaseConfig {
  /** The display name under the icon. */
  @Str() name = "Stackra";
  /** The Expo slug. */
  @Str() slug = "stackra";
  /**
   * Deep-link scheme (`stackra://`); also the PKCE redirect scheme (`identity.config.ts` adds the
   * path).
   */
  @Str({ pattern: /^[a-z][a-z0-9-]+$/ }) scheme = "stackra";
  /** The iOS bundle identity and store fields. */
  @Nested(IosConfig) ios = new IosConfig();
  /** The Android package identity and store fields. */
  @Nested(AndroidConfig) android = new AndroidConfig();
  /** Tool-owned: Expo's `runtimeVersion.policy`. @defaultValue "fingerprint" */
  @OneOf(["fingerprint"]) runtimePolicy = "fingerprint";
  /** Tool-owned: EAS's `cli.appVersionSource`. @defaultValue "remote" */
  @OneOf(["remote", "local"]) appVersionSource = "remote";
  /**
   * Server-side minimum version gate; the last N store versions stay supported. @defaultValue true
   */
  @Bool() minimumVersionGate = true;
  /** How many store versions stay supported behind the gate. @defaultValue 2 */
  @Int({ min: 1 }) supportedStoreVersions = 2;
  /** Tool-owned: Expo's `orientation`. @defaultValue "portrait" */
  @OneOf(["portrait", "default"]) orientation = "portrait";
}
