/**
 * Stackra file contract:
 * Purpose: the privacy section of the settings page: one switch per optional consent category, with
 *          its hint; the screen app-store review asks for before any tracking.
 * Boundary: presentation over @stackra/consent's hook; the decision is stored by the consent
 *           package in the `Prefs` area. `ConsentCategory.Necessary` is shown locked on. Analytics
 *           and crash replay read the same decision.
 * Runtime: react-native
 * Governing contract: ADR 0071
 */
import { useConfig } from "@stackra/config/react";
import { useConsent } from "@stackra/consent/react";
import { useTranslation } from "@stackra/i18n/react";
import { ListGroup, Separator, Switch } from "@stackra/ui/native";
import { Fragment } from "react";
import { ConsentConfig } from "#src/config/consent.config";
import { ConsentCategory } from "#src/enums/consent-category.enum";
import { I18n } from "#stackra/i18n";

/** The consent switches, in the order `ConsentConfig.categories` lists them. */
export function ConsentSection() {
  const { t } = useTranslation();
  const config = useConfig(ConsentConfig);
  const consent = useConsent();

  return (
    <ListGroup accessibilityLabel={t(I18n.mobile.consent.title)} testID="settings-consent">
      {config.categories.map((category, i) => (
        <Fragment key={category.value}>
          {i > 0 ? <Separator className="mx-4" /> : null}
          <ListGroup.Item>
            <ListGroup.ItemContent>
              <ListGroup.ItemTitle>{t(category.label)}</ListGroup.ItemTitle>
              <ListGroup.ItemDescription>{t(category.hint)}</ListGroup.ItemDescription>
            </ListGroup.ItemContent>
            <ListGroup.ItemSuffix>
              <Switch
                isSelected={consent.isGranted(category)}
                isDisabled={category === ConsentCategory.Necessary}
                onSelectedChange={(on) => consent.set(category, on)}
                testID={`consent-${category.value}`}
              />
            </ListGroup.ItemSuffix>
          </ListGroup.Item>
        </Fragment>
      ))}
    </ListGroup>
  );
}
