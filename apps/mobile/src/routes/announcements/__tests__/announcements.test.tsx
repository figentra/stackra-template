/**
 * Stackra file contract:
 * Purpose: through the route adapter, a published document renders; a `null` answer renders the
 *          app's default class; a node naming an unregistered block is refused and shows the error
 *          state.
 * Boundary: unit tier; the experience client is faked; the block registry is the app's real one.
 * Runtime: react-native
 * Governing contract: ADR 0022, ADR 0110
 */
import { fakeClient } from "@stackra/clients/testing";
import { describe, expect, it } from "@stackra/testing";
import { renderRoute, screen } from "@stackra/testing/native";
import { PromoBannerBlock } from "#src/blocks/promo-banner/promo-banner.block";
import { AnnouncementsDocument } from "#src/documents/announcements.document";
import { GetDocumentQuery } from "#stackra/clients/experience";
import { Routes } from "#stackra/routes";

/** The document page over the announcements route. */
describe("Announcements", () => {
  /** The tenant's published tree wins over the default. */
  it("renders the published document", async () => {
    const experience = fakeClient((fake) =>
      fake.on(GetDocumentQuery).returns({
        key: AnnouncementsDocument.key,
        version: 3,
        root: { component: PromoBannerBlock.key, props: { headline: "Welcome back" } },
      }),
    );
    renderRoute(Routes.announcements, { clients: [experience] });
    expect(await screen.findByText("Welcome back")).toBeTruthy();
    expect(experience.called(GetDocumentQuery)).toEqual([{ key: AnnouncementsDocument.key }]);
  });

  /** Nothing published: the adapter falls back to the class, translated. */
  it("renders the default document when nothing is published", async () => {
    const experience = fakeClient((fake) => fake.on(GetDocumentQuery).returns(null));
    renderRoute(Routes.announcements, { locale: "en", clients: [experience] });
    expect(await screen.findByText("Welcome to your workspace")).toBeTruthy();
  });

  /** A node naming no registered block never renders (ADR 0110 decision 6). */
  it("refuses an unregistered component key", async () => {
    const experience = fakeClient((fake) =>
      fake.on(GetDocumentQuery).returns({
        key: AnnouncementsDocument.key,
        version: 1,
        root: { component: "evil.script", props: {} },
      }),
    );
    renderRoute(Routes.announcements, { locale: "en", clients: [experience] });
    expect(await screen.findByTestId("state-error")).toBeTruthy();
  });
});
