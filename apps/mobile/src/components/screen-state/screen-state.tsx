/**
 * Stackra file contract:
 * Purpose: the three non-content states a page shows: loading (skeleton rows), empty (message and
 *          hint), error (message and retry). One component so every page's states look and read
 *          alike.
 * Boundary: a presentational class component. Keys are typed `I18nKey`s, never raw strings. The
 *           error text is the envelope's translated refusal when the producing module ships one
 *           (gen attaches `refusalKey`), else the generic key.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14, as amended by programming model v3.1, AGENTS.md: class
 *                     components), ADR 0140, ADR 0080
 */
import { useTranslation } from "@stackra/i18n/react";
import { Alert, Button, Skeleton } from "@stackra/ui/native";
import { Component } from "#stackra/ui";
import { Text, View } from "react-native";
import type { ScreenStateProps } from "#src/components/screen-state/screen-state.props";
import { I18n } from "#stackra/i18n";

/** The state block, full width, centred text, accessible as a status region. */
export class ScreenState extends Component<ScreenStateProps> {
  /** The translator of the active locale, with `has` for the refusal check. */
  i18n = useTranslation();

  /** One branch per `kind`; the props narrow on it. */
  render() {
    const { t, has } = this.i18n;
    const props = this.props;

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
}
