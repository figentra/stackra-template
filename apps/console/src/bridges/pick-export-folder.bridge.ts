/**
 * Stackra file contract:
 * Purpose: `console.export.pick_folder`: shows the native folder picker so an export lands where
 *          the user chose.
 * Boundary: a `@Bridge` on the filesystem port; on web the same feature uses the File System Access
 *           driver of the same port, so the renderer never branches on target. Returns a folder
 *           handle only; writing goes through the same port.
 * Runtime: node
 * Governing contract: ADR 0251, ADR 0250 (web is the baseline, desktop adds), ADR 0256
 */
import { ActorKind } from "@stackra/contracts";
import type { FileSystem } from "@stackra/filesystem/contracts";
import { Capability } from "@stackra/platform";
import { Bridge, type BridgeContext } from "@stackra/platform/electron";
import { Commerce } from "#stackra/clients";
import { PickExportFolderInput } from "#src/schemas/pick-export-folder-input.schema";
import { PickExportFolderOutput } from "#src/schemas/pick-export-folder-output.schema";

/** Shows the picker modal to the calling window, titled in the renderer's locale. */
@Bridge({
  key: "export.pick_folder",
  input: PickExportFolderInput,
  output: PickExportFolderOutput,
  permission: Commerce.permissions.Order.read,
  actors: [ActorKind.User],
  capability: Capability.FilesSave,
})
export class PickExportFolderBridge {
  constructor(private readonly files: FileSystem) {}

  /** A cancelled dialog resolves to `folder: null`, never an error. */
  async handle(input: PickExportFolderInput, ctx: BridgeContext): Promise<PickExportFolderOutput> {
    const folder = await this.files.pickFolder({
      title: ctx.t(input.titleKey),
      window: ctx.window,
    });
    return { folder };
  }
}
