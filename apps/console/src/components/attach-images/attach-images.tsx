/**
 * Stackra file contract:
 * Purpose: attaches images that reached the console from outside (the PWA share target, the file
 *          handler) to a product: a preview of each image, a variant picker that names the product,
 *          one shared description and the attach button.
 * Boundary: each image is uploaded through the media package, then attached with the generated
 *           `AttachProductImageAction`, so permission, the Idempotency-Key and the declared success
 *           text apply; one failed image is a toast and the others still go. Only PNG, JPEG and
 *           WebP are accepted, the same types pwa.config.ts declares for the share target and the
 *           file handler; anything else is listed and skipped. The previews are an ImagePreviews
 *           grid keyed by the accepted set, so a new `files` prop remounts it and its object URLs
 *           always match `images`. A class component; gen compiles it to a function component.
 * Runtime: browser
 * Governing contract: ADR 0255 (share target, file handlers), ADR 0165 (form adapters), ADR 0294
 *                     (as amended by programming model v3.1, AGENTS.md: class components)
 */
import { useAction } from "@stackra/clients/react";
import { useTranslation } from "@stackra/i18n/react";
import { useUpload } from "@stackra/media/react";
import { Button, Component, Description, toast } from "@stackra/ui";
import { Field, Form, useSchemaForm } from "@stackra/ui/form";
import { AttachProductImageAction } from "#stackra/clients/commerce";
import { I18n } from "#stackra/i18n";
import { ImagePreviews } from "#src/components/image-previews";
import { useVariantSearch } from "#src/hooks/use-variant-search";
import { AttachImagesForm } from "#src/schemas/attach-images-form.schema";
import type { AttachImagesProps } from "./attach-images.props";

/** The media types the console accepts from outside; pwa.config.ts declares the same list. */
const ACCEPTED_TYPES: ReadonlySet<string> = new Set(["image/png", "image/jpeg", "image/webp"]);

/** Previews, the product picker, the description and the attach button. */
export class AttachImages extends Component<AttachImagesProps> {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** Uploads one file and returns the `Upload` the action takes. */
  upload = useUpload();

  /** The generated attach action. */
  attachImage = useAction(AttachProductImageAction);

  /** True while a run is in flight; the button shows its pending state. */
  isAttaching = false;

  /** The accepted images, in the order received. */
  get images() {
    return this.props.files.filter((file) => ACCEPTED_TYPES.has(file.type));
  }

  /** Identifies the accepted set; a different set remounts the previews with fresh URLs. */
  get imagesKey() {
    return this.images.map((file) => `${file.name}:${file.size}:${file.lastModified}`).join("/");
  }

  /** The files that are not an accepted image. */
  get rejected() {
    return this.props.files.filter((file) => !ACCEPTED_TYPES.has(file.type));
  }

  /** Uploads and attaches each image in turn; one failure never stops the rest. */
  async attach(values: AttachImagesForm) {
    this.isAttaching = true;
    let attached = 0;
    for (const file of this.images) {
      try {
        const image = await this.upload(file);
        await this.attachImage.run({ productId: values.productId, image, alt: values.alt || null });
        attached += 1;
      } catch {
        toast.danger(this.i18n.t(I18n.console.attach.failed, { name: file.name }));
      }
    }
    this.isAttaching = false;
    if (attached > 0) toast.success(this.i18n.t(I18n.console.attach.done, { count: attached }));
    this.props.onAttached?.(attached);
  }

  /** The previews, the skipped files and the form. */
  render() {
    const { t } = this.i18n;
    const form = useSchemaForm(AttachImagesForm, { defaultValues: { alt: "" } });
    const variants = useVariantSearch(form.watch("productId") ?? "");
    return (
      <Form
        form={form}
        onSubmit={form.handleSubmit((values) => this.attach(values))}
        aria-label={t(I18n.console.attach.submit)}
        className="flex max-w-xl flex-col gap-4"
      >
        <p>{t(I18n.console.attach.images, { count: this.images.length })}</p>
        <ImagePreviews key={this.imagesKey} images={this.images} />
        {this.rejected.map((file) => (
          <Description key={file.name} role="note">
            {t(I18n.console.attach.unsupported, { name: file.name })}
          </Description>
        ))}
        <Field.ComboBox
          name="productId"
          label={t(I18n.console.attach.product)}
          description={t(I18n.console.attach.product_hint)}
          items={variants.items}
          itemKey="productId"
          itemLabel={(v) => `${v.sku} · ${v.title}`}
          isLoading={variants.isLoading}
          isRequired
        />
        <Field.Text name="alt" label={t(I18n.console.attach.alt)} />
        <Button
          type="submit"
          isPending={this.isAttaching}
          isDisabled={this.images.length === 0}
          className="self-start"
        >
          {t(I18n.console.attach.submit)}
        </Button>
      </Form>
    );
  }
}
