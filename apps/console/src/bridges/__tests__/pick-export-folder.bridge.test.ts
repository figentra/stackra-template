/**
 * Stackra file contract:
 * Purpose: proves the folder bridge asks the filesystem port with the translated title and returns
 *          `null` when the user cancels, so the renderer treats a cancel as "no export", not as an
 *          error.
 * Boundary: unit tier, node; the filesystem port is `@stackra/filesystem/testing`'s fake.
 * Runtime: node
 * Governing contract: ADR 0022, ADR 0251, ADR 0007
 */
import { describe, expect, it } from "@stackra/testing";
import { fakeFileSystem } from "@stackra/filesystem/testing";
import { runBridge } from "@stackra/platform/testing";
import { PickExportFolderBridge } from "#src/bridges/pick-export-folder.bridge";

/** Guards the export-folder bridge, the console's one use of the filesystem port. */
describe(PickExportFolderBridge, () => {
  /** The picked folder must come back as chosen, titled in the user's language. */
  it("returns the chosen folder and titles the dialog in the renderer's locale", async () => {
    const files = fakeFileSystem({ pickFolder: "/Users/staff/exports" });
    const result = await runBridge(PickExportFolderBridge, {}, { replace: [files], locale: "ar" });
    expect(result.folder).toBe("/Users/staff/exports");
    expect(files.lastPickTitle()).toBe("اختر مجلد التصدير");
  });

  /** Closing the dialog is a normal outcome and must not surface as a refusal. */
  it("returns null when the user cancels", async () => {
    const files = fakeFileSystem({ pickFolder: null });
    expect((await runBridge(PickExportFolderBridge, {}, { replace: [files] })).folder).toBeNull();
  });
});
