/**
 * Stackra file contract:
 * Purpose: the sessionless frame: the brand mark above the outlet, `main` with the id the skip link
 *          targets.
 * Boundary: presentation; the component of `PublicLayout`.
 * Runtime: browser
 * Governing contract: ADR 0241, ADR 0234 (asset keys)
 */
import { Outlet } from "@stackra/navigation/react";
import { useAsset } from "@stackra/assets/react";
import { useTranslation } from "@stackra/i18n/react";
import { Assets } from "#stackra/assets";
import { I18n } from "#stackra/i18n";

/** Logo above the outlet. */
export function PublicFrame() {
  const { t } = useTranslation();
  const logo = useAsset(Assets.console.public.logo_svg);
  return (
    <main id="main" className="grid min-h-dvh place-items-center gap-6 p-4">
      <img src={logo.url} alt={t(I18n.console.shell.brand)} className="h-8" />
      <Outlet />
    </main>
  );
}
