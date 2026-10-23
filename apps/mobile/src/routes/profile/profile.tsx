/**
 * Stackra file contract:
 * Purpose: the profile page: the signed-in user, the active tenant with its roles, and a switcher
 *          across memberships.
 * Boundary: a class component bound to `ProfileRoute` by its file name, its props typed
 *           `RouteProps<typeof ProfileRoute>`; reads its hook beside it. A switch refused because
 *           queued writes wait is explained with a toast. Roles are displayed, never edited here.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 7 and 14, as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0206, ADR 0208
 */
import { useTranslation } from "@stackra/i18n/react";
import type { RouteProps } from "@stackra/navigation/native";
import { Avatar, Card, Chip, Component, ListGroup, Separator, useToast } from "@stackra/ui/native";
import { Fragment } from "react";
import { View } from "react-native";
import { Screen } from "#src/components/screen";
import type { ProfileRoute } from "#src/routes/profile/profile.route";
import { useProfile } from "#src/routes/profile/use-profile";
import { I18n } from "#stackra/i18n";

/** The profile; the route needs a session, so the hook asserts it rather than checking it. */
export class Profile extends Component<RouteProps<typeof ProfileRoute>> {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** The toast region of the UI kit. */
  toasts = useToast();

  /** The user, the memberships and the switch. */
  profile = useProfile();

  /** Switches the tenant; a refusal is explained with a warning toast. */
  async switchTenant(tenantId: string) {
    const result = await this.profile.switchTo(tenantId);
    if (result !== true) this.toasts.toast.show({ variant: "warning", label: this.i18n.t(result) });
  }

  /** The user card, the active tenant with its roles, and the switcher for two or more. */
  render() {
    const { t } = this.i18n;
    const { user, current, memberships } = this.profile;

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
              <Card.Title>{t(I18n.pages.profile.tenant)}</Card.Title>
            </Card.Header>
            <Card.Body className="gap-2">
              <Card.Description>{current.name}</Card.Description>
              <View
                className="flex-row flex-wrap gap-2"
                accessibilityLabel={t(I18n.pages.profile.roles)}
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
          <ListGroup accessibilityLabel={t(I18n.pages.profile.switch_tenant)}>
            {memberships.map((m, i) => (
              <Fragment key={m.tenantId}>
                {i > 0 ? <Separator className="mx-4" /> : null}
                <ListGroup.Item
                  onPress={() => void this.switchTenant(m.tenantId)}
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
  }
}
