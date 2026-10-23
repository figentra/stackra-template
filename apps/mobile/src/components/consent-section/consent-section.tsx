/**
 * Stackra file contract:
 * Purpose: the privacy section of the settings page: one switch per consent category, with its
 *          hint; the screen app-store review asks for before any tracking.
 * Boundary: presentation over @stackra/consent's hook; the package stores the decision with its
 *           policy version in the `Prefs` area. `ConsentCategory.Necessary` is shown locked on.
 *           The label is the enum's derived key, the hint its meta. Analytics and crash replay read
 *           the same decision.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14), ADR 0298, ADR 0071
 */
import { useConfig } from "@stackra/config/react";
import { useConsent } from "@stackra/consent/react";
import { useTranslation } from "@stackra/i18n/react";
import { ListGroup, Separator, Switch } from "@stackra/ui/native";
import { Enum } from "@stackra/validation";
import { Fragment } from "react";
import { MobileConsentConfig } from "#src/config/consent.config";
import { ConsentCategory } from "#src/enums/consent-category.enum";
import { I18n } from "#stackra/i18n";

/** The consent switches, in the order `MobileConsentConfig.categories` lists them. */
export function ConsentSection() {
  const { t } = useTranslation();
  const config = useConfig(MobileConsentConfig);
  const consent = useConsent();

  return (
    <ListGroup accessibilityLabel={t(I18n.mobile.consent.title)} testID="settings-consent">
      {config.categories.map((category, i) => (
        <Fragment key={category}>
          {i > 0 ? <Separator className="mx-4" /> : null}
          <ListGroup.Item>
            <ListGroup.ItemContent>
              <ListGroup.ItemTitle>
                {t(I18n.mobile.enums.consent_category[category])}
              </ListGroup.ItemTitle>
              <ListGroup.ItemDescription>
                {t(Enum.meta(ConsentCategory, category).hint)}
              </ListGroup.ItemDescription>
            </ListGroup.ItemContent>
            <ListGroup.ItemSuffix>
              <Switch
                isSelected={consent.isGranted(category)}
                isDisabled={category === ConsentCategory.Necessary}
                onSelectedChange={(on) => consent.set(category, on)}
                testID={`consent-${category}`}
              />
            </ListGroup.ItemSuffix>
          </ListGroup.Item>
        </Fragment>
      ))}
    </ListGroup>
  );
}
