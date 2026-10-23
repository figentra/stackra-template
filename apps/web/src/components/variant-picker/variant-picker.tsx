/**
 * Stackra file contract:
 * Purpose: one Select per option axis (Size, Colour) bound to the variant choice.
 * Boundary: presentation; the choice and the matching are the hook's.
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 14, as amended by programming model v3.1, AGENTS.md: class
 *                     components), WCAG 2.2 AA (each select labelled with the axis name)
 */
import { useTranslation } from "@stackra/i18n/react";
import { Component, Select } from "@stackra/ui";
import { I18n } from "#stackra/i18n";
import type { VariantPickerProps } from "./variant-picker.props";

/** Nothing renders for a single-variant product (no axes). */
export class VariantPicker extends Component<VariantPickerProps> {
  /** The translator of the visitor's locale. */
  translation = useTranslation();

  /** One labelled Select per axis, showing the chosen variant's value. */
  render() {
    const { t } = this.translation;
    const { variant, options, choose } = this.props.choice;
    return (
      <>
        {Object.entries(options).map(([axis, values]) => (
          <Select
            key={axis}
            label={t(I18n.web.product.variant_axis, { axis })}
            className="mt-4"
            selectedKey={variant.options[axis]}
            onSelectionChange={(key) => choose(axis, String(key))}
          >
            {values.map((value) => (
              <Select.Item key={value} id={value}>
                {value}
              </Select.Item>
            ))}
          </Select>
        ))}
      </>
    );
  }
}
