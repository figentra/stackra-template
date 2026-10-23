/**
 * Stackra file contract:
 * Purpose: the profile page: the signed-in user, the active tenant with its roles, and a switcher
 *          across memberships.
 * Boundary: a function component bound to `ProfileRoute` by its file name; reads its hook beside
 *           it. A switch refused because queued writes wait is explained with a toast. Roles are
 *           displayed, never edited here.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 7 and 14), ADR 0206, ADR 0208
 */
import { useTranslation } from "@stackra/i18n/react";
import type { RouteComponent } from "@stackra/navigation/native";
import { Avatar, Card, Chip, ListGroup, Separator, useToast } from "@stackra/ui/native";
import { Fragment } from "react";
import { View } from "react-native";
import { Screen } from "#src/components/screen";
import type { ProfileRoute } from "#src/routes/profile/profile.route";
import { useProfile } from "#src/routes/profile/use-profile";
import { I18n } from "#stackra/i18n";

/** The profile; the route needs a session, so the hook asserts it rather than checking it. */
export const Profile: RouteComponent<typeof ProfileRoute> = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, current, memberships, switchTo } = useProfile();
  const onSwitch = async (tenantId: string) => {
    const result = await switchTo(tenantId);
    if (result !== true) toast.show({ variant: "warning", label: t(result) });
  };

  return (
    <Screen testID="profile-page">
      <Card>
        <Card.Body className="flex-row items-center gap-4">
          <Avatar alt={user.displayName} size="lg">
            <Avatar.Fallback>{user.displayName.slice(0, 1)}</Avatar.Fallback>
          </Avatar>
          <View className="flex-1 gap-1">
            <Card.Title>{user.displayName}</Card.Title>
            <Card.Description>{user.email}</Card.Description>
          </View>
        </Card.Body>
      </Card>

      {current ? (
        <Card>
          <Card.Header>
            <Card.Title>{t(I18n.mobile.profile.tenant)}</Card.Title>
          </Card.Header>
          <Card.Body className="gap-2">
            <Card.Description>{current.name}</Card.Description>
            <View
              className="flex-row flex-wrap gap-2"
              accessibilityLabel={t(I18n.mobile.profile.roles)}
            >
              {current.roles.map((role) => (
                <Chip key={role} size="sm" variant="soft" color="default">
                  <Chip.Label>{role}</Chip.Label>
                </Chip>
              ))}
            </View>
          </Card.Body>
        </Card>
      ) : null}

      {memberships.length > 1 ? (
        <ListGroup accessibilityLabel={t(I18n.mobile.profile.switch_tenant)}>
          {memberships.map((m, i) => (
            <Fragment key={m.tenantId}>
              {i > 0 ? <Separator className="mx-4" /> : null}
              <ListGroup.Item
                onPress={() => void onSwitch(m.tenantId)}
                isDisabled={m.tenantId === current?.tenantId}
                testID={`tenant-${m.tenantId}`}
              >
                <ListGroup.ItemContent>
                  <ListGroup.ItemTitle>{m.name}</ListGroup.ItemTitle>
                </ListGroup.ItemContent>
                <ListGroup.ItemSuffix />
              </ListGroup.Item>
            </Fragment>
          ))}
        </ListGroup>
      ) : null}
    </Screen>
  );
};
