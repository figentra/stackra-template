/**
 * Stackra file contract:
 * Purpose: the console's replacement for the order status badge declared by commerce (its
 *          `OrderStatusBadge` override point): the translated status, coloured by the case, as a
 *          small chip in the resource table and a regular one in the infolist.
 * Boundary: the override is a class whose options name the component; props are typed from the
 *           override point, so a changed props shape in commerce is a type error here. Gen refuses
 *           an `@Override` of a point nobody declares.
 * Runtime: browser
 * Governing contract: ADR 0234 (asset and override keys)
 */
import { Override, type OverrideComponent } from "@stackra/panel";
import { Chip } from "@stackra/ui";
import { useTranslation } from "@stackra/i18n/react";
import { Commerce } from "#stackra/clients";

/**
 * `status` is an `OrderStatus` case: `label` is the i18n key, `meta.color` the chip colour. The
 * code itself is never shown: a reader sees "Paid", never `paid`.
 */
const StatusChip: OverrideComponent<typeof Commerce.overrides.OrderStatusBadge> = ({
  status,
  compact,
}) => {
  const { t } = useTranslation();
  return (
    <Chip color={status.meta.color} size={compact ? "sm" : "md"}>
      {t(status.label)}
    </Chip>
  );
};

/** Console replacement for the `OrderStatusBadge` override declared by commerce. */
@Override(Commerce.overrides.OrderStatusBadge, { component: StatusChip })
export class OrderStatusBadgeOverride {}
