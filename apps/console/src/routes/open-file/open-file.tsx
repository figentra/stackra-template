/**
 * Stackra file contract:
 * Purpose: the opened-images page, bound to `OpenFileRoute` by name: the files the operating system
 *          handed to the console, in the attach-images form.
 * Boundary: reads the launch queue through `useLaunchedFiles` from `@stackra/platform/react` (the
 *           PWA's `launchQueue`, the desktop's open-file event), which keeps only the files of the
 *           latest launch; the attach-images component runs the upload and the action. A class
 *           component typed by its route (`RouteProps<typeof OpenFileRoute>`), so it needs no props
 *           file; gen compiles it to a function component.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 14; as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0255 (file handlers), ADR 0250
 */
import { useTranslation } from "@stackra/i18n/react";
import type { RouteProps } from "@stackra/navigation";
import { useLaunchedFiles } from "@stackra/platform/react";
import { Component, Description } from "@stackra/ui";
import { I18n } from "#stackra/i18n";
import { AttachImages } from "#src/components/attach-images";
import { EmptyView } from "#src/components/empty-view";
import type { OpenFileRoute } from "#src/routes/open-file/open-file.route";

/** The heading and the attach form, or the empty state before a launch. */
export class OpenFile extends Component<RouteProps<typeof OpenFileRoute>> {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** The files of the latest launch; empty when the page was opened another way. */
  files = useLaunchedFiles();

  /** The page body. */
  render() {
    const { t } = this.i18n;
    if (this.files.length === 0) {
      return (
        <EmptyView
          title={I18n.pages.open_file.empty_title}
          description={I18n.pages.open_file.empty_body}
          icon="image"
        />
      );
    }
    return (
      <div className="flex max-w-2xl flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">{t(I18n.pages.open_file.title)}</h1>
          <Description>{t(I18n.pages.open_file.body)}</Description>
        </header>
        <AttachImages key={this.files.map((file) => file.name).join("|")} files={this.files} />
      </div>
    );
  }
}
