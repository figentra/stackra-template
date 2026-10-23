/**
 * Stackra file contract:
 * Purpose: the grid is a labelled section with one list item per feature.
 * Boundary: unit tier, jsdom.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0110
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { Icons } from "@stackra/ui/icons";
import { FeatureGrid } from "#src/blocks/feature-grid/feature-grid";

/** Guards the feature grid a tenant places on a landing page. */
describe(FeatureGrid, () => {
  /** Screen readers jump to the section by its heading and hear the feature count. */
  it("renders one item per feature under a labelled section", () => {
    const features = [
      { icon: Icons.Catalogue, title: "Catalogue", body: "Every product in one place." },
      { icon: Icons.Catalogue, title: "Orders", body: "Track every order." },
    ];
    render(<FeatureGrid title="Features" features={features} />, { locale: "en" });
    expect(screen.getByRole("region", { name: "Features" })).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
