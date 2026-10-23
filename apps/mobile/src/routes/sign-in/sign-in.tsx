/**
 * Stackra file contract:
 * Purpose: the sign-in page: a welcome panel and one button that opens the identity provider's
 *          hosted sign-in in the system browser (PKCE). There is no credential field in the app.
 * Boundary: a class component bound to `SignInRoute` by its file name, its props typed
 *           `RouteProps<typeof SignInRoute>`; presentation only, `signIn` is the identity
 *           package's. An error from the flow (cancelled, network) shows inline: `failed` is the
 *           page's one state field.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 7 and 14, as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0206
 */
import { useTranslation } from "@stackra/i18n/react";
import { SessionStatus } from "@stackra/identity";
import { useSession } from "@stackra/identity/react";
import type { RouteProps } from "@stackra/navigation/native";
import { Alert, Button } from "@stackra/ui/native";
import { Component } from "#stackra/ui";
import { Text, View } from "react-native";
import { Glass } from "#src/components/glass";
import type { SignInRoute } from "#src/routes/sign-in/sign-in.route";
import { I18n } from "#stackra/i18n";

/** The sign-in page. */
export class SignIn extends Component<RouteProps<typeof SignInRoute>> {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** The session whose `signIn` opens the hosted page. */
  session = useSession();

  /** Whether the last sign-in attempt failed; cleared by the next attempt. */
  failed = false;

  /** Starts the hosted flow; a cancelled or failed flow shows the inline error. */
  signIn() {
    this.failed = false;
    this.session.signIn().catch(() => {
      this.failed = true;
    });
  }

  /** The welcome panel, the error when the last attempt failed, and the button. */
  render() {
    const { t } = this.i18n;
    return (
      <View
        className="flex-1 items-center justify-center gap-6 bg-background px-6"
        testID="sign-in-page"
      >
        <Glass>
          <Text className="text-2xl font-semibold text-ink">{t(I18n.pages.sign_in.heading)}</Text>
          <Text className="mt-2 text-ink-muted">{t(I18n.pages.sign_in.body)}</Text>
        </Glass>
        {this.failed ? (
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{t(I18n.mobile.state.error)}</Alert.Title>
            </Alert.Content>
          </Alert>
        ) : null}
        <Button
          className="self-stretch"
          onPress={() => this.signIn()}
          isDisabled={this.session.status === SessionStatus.Loading}
          testID="sign-in-button"
        >
          {t(I18n.pages.sign_in.button)}
        </Button>
      </View>
    );
  }
}
