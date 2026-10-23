/**
 * Stackra file contract:
 * Purpose: proves the opened-images page hands the launched files to the attach form, and shows the
 *          empty state when the page was opened without a launch.
 * Boundary: unit tier, jsdom; the launch queue is the platform package's testing fake.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0255 (file handlers)
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { OpenFile } from "#src/routes/open-file/open-file";

/** Guards the page the operating system opens images with. */
describe(OpenFile, () => {
  /** A launch with one image shows it ready to attach. */
  it("shows the launched image in the attach form", () => {
    const launched = [new File(["img"], "label.png", { type: "image/png" })];
    render(<OpenFile />, { locale: "en", platform: { launchedFiles: launched } });
    expect(screen.getByRole("heading", { level: 1, name: "Opened images" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "label.png" })).toBeTruthy();
  });

  /** Opened from a bookmark, the page says what it is for instead of an empty form. */
  it("shows the empty state in Arabic without a launch", () => {
    render(<OpenFile />, { locale: "ar", platform: { launchedFiles: [] } });
    expect(screen.getByText("لم تُفتح أي صورة")).toBeTruthy();
  });
});
