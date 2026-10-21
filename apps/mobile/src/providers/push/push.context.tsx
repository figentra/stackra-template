/**
 * Stackra file contract:
 * Purpose: registers this device with the devices module once per session and tenant, after the OS
 *          grant the configured moment asks for, and routes a tapped notification's URL into the
 *          generated linking config. Renders children unchanged.
 * Boundary: the registration goes through `Devices.actions.RegisterDevice`, named here (never in a
 *           config field) and queued offline by the generated offline map, so a cold start without
 *           network still registers later. A denial ends the effect quietly; the settings switch
 *           offers the prompt again.
 * Runtime: react-native
 * Governing contract: ADR 0062, ADR 0235, ADR 0250
 */
import { useAction } from "@stackra/clients/react";
import { useConfig } from "@stackra/config/react";
import { useLocale } from "@stackra/i18n/react";
import { useSession } from "@stackra/identity/react";
import { PromptMoment } from "@stackra/platform";
import { useCapability } from "@stackra/platform/react";
import { useTenant } from "@stackra/tenancy/react";
import * as Linking from "expo-linking";
import { type ReactNode, useEffect } from "react";
import { Platform } from "react-native";
import { SessionStatus } from "@stackra/identity";
import { PushConfig } from "#src/config/push.config";
import { Devices } from "#stackra/clients";

/** The provider takes only the subtree it wraps. */
export interface PushContextProviderProps {
  /** The tree; nothing below reads a push context, the component is an effect holder. */
  readonly children: ReactNode;
}

/**
 * Registers once a session and a tenant exist; re-registers on a tenant switch or a locale change.
 */
export function PushContextProvider({ children }: PushContextProviderProps) {
  const config = useConfig(PushConfig);
  const push = useCapability("push", { required: false });
  const session = useSession();
  const tenant = useTenant({ optional: true });
  const { locale } = useLocale();
  const register = useAction(Devices.actions.RegisterDevice);

  useEffect(() => {
    if (!push || session.status !== SessionStatus.SignedIn || !tenant) return;
    let isCancelled = false;
    const grant =
      config.askOn === PromptMoment.FirstSession ? push.register() : push.registerIfGranted();
    void grant.then((result) => {
      if (isCancelled || result.status !== "granted") return;
      return register.run({
        installationId: result.installationId,
        platform: Devices.enums.DevicePlatform.from(Platform.OS),
        pushToken: result.token,
        locale: locale.value,
      });
    });
    // the deep link the service put in the payload, resolved by the generated linking
    const off = push.onOpen((notification) => {
      if (notification.url) void Linking.openURL(notification.url);
    });
    return () => {
      isCancelled = true;
      off();
    };
  }, [push, session.status, tenant?.tenantId, locale, register, config.askOn]);

  return <>{children}</>;
}
