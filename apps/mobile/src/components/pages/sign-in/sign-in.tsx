/**
 * Stackra file contract:
 * Purpose: the sign-in page: the brand mark, one line, one button that opens ZITADEL's hosted
 *          sign-in in the system browser (PKCE). There is no credential field in the app.
 * Boundary: presentation; `signIn` is the identity module's. An error from the flow (cancelled,
 *           network) shows inline.
 * Runtime: react-native
 * Governing contract: ADR 0206
 */
import { useTranslation } from "@stackra/i18n/react";
import { useSession } from "@stackra/identity/react";
import type { RouteComponent } from "@stackra/navigation/native";
import { Alert, Button } from "@stackra/ui/native";
import { useState } from "react";
import { Text, View } from "react-native";
import { SessionStatus } from "@stackra/identity";
import { Glass } from "#src/components/ui/glass";
import type { SignInRoute } from "#src/routes/sign-in.route";
import { I18n } from "#stackra/i18n";

/** The sign-in page. */
export const SignInPage: RouteComponent<typeof SignInRoute> = () => {
  const { t } = useTranslation();
  const session = useSession();
  const [failed, setFailed] = useState(false);

  return (
    <View
      className="flex-1 items-center justify-center gap-6 bg-background px-6"
      testID="sign-in-page"
    >
      <Glass>
        <Text className="text-2xl font-semibold text-ink">{t(I18n.mobile.sign_in.title)}</Text>
        <Text className="mt-2 text-ink-muted">{t(I18n.mobile.sign_in.body)}</Text>
      </Glass>
      {failed ? (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{t(I18n.mobile.state.error)}</Alert.Title>
          </Alert.Content>
        </Alert>
      ) : null}
      <Button
        className="self-stretch"
        onPress={() => session.signIn().catch(() => setFailed(true))}
        isDisabled={session.status === SessionStatus.Loading}
        testID="sign-in-button"
      >
        {t(I18n.mobile.sign_in.button)}
      </Button>
    </View>
  );
};
