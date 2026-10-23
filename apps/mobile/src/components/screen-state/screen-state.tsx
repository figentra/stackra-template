/**
 * Stackra file contract:
 * Purpose: the three non-content states a page shows: loading (skeleton rows), empty (message and
 *          hint), error (message and retry). One component so every page's states look and read
 *          alike.
 * Boundary: presentation only. Keys are typed `I18nKey`s, never raw strings. The error text is the
 *           envelope's translated refusal when the producing module ships one (gen attaches
 *           `refusalKey`), else the generic key.
 * Runtime: react-native
 * Governing contract: ADR 0140, ADR 0080
 */
import type { ClientError } from "@stackra/clients";
import { useTranslation } from "@stackra/i18n/react";
import { Alert, Button, Skeleton } from "@stackra/ui/native";
import { Text, View } from "react-native";
import { I18n, type I18nKey } from "#stackra/i18n";

/** Props of {@link ScreenState}. */
export type ScreenStateProps =
  | {
      /** Skeleton rows while the first page loads; never shown on a refetch (the data stays). */
      readonly kind: "loading";
      /** How many rows to sketch. @defaultValue 3 */
      readonly rows?: number;
    }
  | {
      /** Nothing to show; `title` and `hint` are typed keys. */
      readonly kind: "empty";
      readonly title: I18nKey;
      readonly hint?: I18nKey;
    }
  | {
      /** A failed read; the envelope's refusal picks the message when the module ships one. */
      readonly kind: "error";
      readonly error: ClientError;
      /** Retries the read. */
      readonly onRetry: () => void;
    };

/** The state block, full width, centred text, accessible as a status region. */
export function ScreenState(props: ScreenStateProps) {
  const { t, has } = useTranslation();

  if (props.kind === "loading")
    return (
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={t(I18n.mobile.state.loading)}
        className="gap-3"
        testID="state-loading"
      >
        {Array.from({ length: props.rows ?? 3 }, (_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </View>
    );

  if (props.kind === "empty")
    return (
      <View className="items-center gap-2 py-16" testID="state-empty">
        <Text className="text-lg font-semibold text-ink">{t(props.title)}</Text>
        {props.hint ? <Text className="text-center text-ink-muted">{t(props.hint)}</Text> : null}
      </View>
    );

  return (
    <Alert status="danger" testID="state-error">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{t(I18n.mobile.state.error)}</Alert.Title>
        <Alert.Description>
          {props.error.refusalKey && has(props.error.refusalKey)
            ? t(props.error.refusalKey)
            : props.error.message}
        </Alert.Description>
        <Button size="sm" variant="secondary" onPress={props.onRetry} className="mt-2 self-start">
          {t(I18n.mobile.state.retry)}
        </Button>
      </Alert.Content>
    </Alert>
  );
}
