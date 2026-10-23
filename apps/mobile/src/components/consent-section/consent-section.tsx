/**
 * Stackra file contract:
 * Purpose: the privacy section of the settings page: one switch per consent category, with its
 *          hint; the screen app-store review asks for before any tracking.
 * Boundary: a class component over @stackra/consent's hook, read as a hook field; the package
 *           stores the decision with its policy version in the `Prefs` area.
 *           `ConsentCategory.Necessary` is shown locked on. The label is the enum's derived key,
 *           the hint its meta. Analytics and crash replay read the same decision. It takes no
 *           props, so it has no Props file.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14, as amended by programming model v3.1, AGENTS.md: class
 *                     components), ADR 0298, ADR 0071
 */
import { useConfig } from "@stackra/config/react";
import { useConsent } from "@stackra/consent/react";
import { useTranslation } from "@stackra/i18n/react";
import { Component, ListGroup, Separator, Switch } from "@stackra/ui/native";
import { Enum } from "@stackra/validation";
import { Fragment } from "react";
import { ConsentConfig } from "#src/config/consent.config";
import { ConsentCategory } from "#src/enums/consent-category.enum";
import { I18n } from "#stackra/i18n";

/** The consent switches, in the order `ConsentConfig.categories` lists them. */
export class ConsentSection extends Component {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** The app's consent configuration: the categories and their order. */
  config = useConfig(ConsentConfig);

  /** The stored decision per category and its writer. */
  consent = useConsent();

  /** One row per category, separated, the necessary one locked on. */
  render() {
    const { t } = this.i18n;
    return (
      <ListGroup accessibilityLabel={t(I18n.mobile.consent.title)} testID="settings-consent">
        {this.config.categories.map((category, i) => (
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
                  isSelected={this.consent.isGranted(category)}
                  isDisabled={category === ConsentCategory.Necessary}
                  onSelectedChange={(on) => this.consent.set(category, on)}
                  testID={`consent-${category}`}
                />
              </ListGroup.ItemSuffix>
            </ListGroup.Item>
          </Fragment>
        ))}
      </ListGroup>
    );
  }
}
