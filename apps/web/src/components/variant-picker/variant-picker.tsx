/**
 * Stackra file contract:
 * Purpose: one Select per option axis (Size, Colour) bound to the variant choice.
 * Boundary: presentation; the choice and the matching are the hook's.
 * Runtime: browser
 * Governing contract: ADR 0128, WCAG 2.2 AA (each select labelled with the axis name)
 */
import { Select } from "@stackra/ui";
import { useTranslation } from "@stackra/i18n/react";
import type { VariantChoice } from "#src/hooks/use-variant-choice";
import { I18n } from "#stackra/i18n";

/** The hook's result, passed down so the page and the picker agree on the variant. */
export interface VariantPickerProps {
  /** The choice the product page holds, so the page and the picker agree on the variant. */
  readonly choice: VariantChoice;
}

/** Nothing renders for a single-variant product (no axes). */
export function VariantPicker({ choice }: VariantPickerProps) {
  const { t } = useTranslation();
  const { variant, options, choose } = choice;
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
