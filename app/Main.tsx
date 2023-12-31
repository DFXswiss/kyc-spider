import "./i18n/i18n";
import React, { useEffect, useState } from "react";
import { LinkingOptions, NavigationContainer } from "@react-navigation/native";
import Routes from "./config/Routes";
import AppTheme from "./styles/AppTheme";
import { Paragraph, Portal, Provider, Snackbar } from "react-native-paper";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { navigationRef } from "./utils/NavigationHelper";
import { StyleSheet, View } from "react-native";
import HeaderContent from "./components/HeaderContent";
import Sizes from "./config/Sizes";
import { useDevice } from "./hooks/useDevice";
import NotificationService, { Level, Notification } from "./services/NotificationService";
import AppStyles from "./styles/AppStyles";
import Colors from "./config/Colors";
import KycScreen from "./screens/KycScreen";
import NotFoundScreen from "./screens/NotFoundScreen";
import { DrawerNavigationHelpers } from "@react-navigation/drawer/lib/typescript/src/types";

const DrawerContent = ({ navigation }: { navigation: DrawerNavigationHelpers }) => {
  const device = useDevice();

  return (
    <>
      <View style={[styles.contentContainer, device.SM && AppStyles.noDisplay]}>
        <HeaderContent onChange={navigation.closeDrawer} drawer />
      </View>
    </>
  );
};

const Main = () => {
  const drawer = createDrawerNavigator();
  const linking: LinkingOptions = {
    prefixes: [],
    config: {
      screens: {
        [Routes.Kyc]: "",
        [Routes.NotFound]: "*",
      },
    },
  };
  const screens = [
    { route: Routes.Kyc, screen: KycScreen },
    { route: Routes.NotFound, screen: NotFoundScreen },
  ];

  const [snackVisible, setSnackVisible] = useState<boolean>(false);
  const [snackContent, setSnackContent] = useState<Notification>();

  useEffect(() => {
    const subscription = NotificationService.Notifications$.subscribe((notification) => {
      setSnackContent(notification);
      setSnackVisible(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Provider theme={AppTheme}>
      <Portal.Host>
        <Portal>
          <Snackbar
            visible={snackVisible}
            onDismiss={() => setSnackVisible(false)}
            action={{
              label: "",
              icon: "close",
              color: snackContent?.level === Level.ERROR ? Colors.Error : Colors.Black,
            }}
            duration={Snackbar.DURATION_MEDIUM}
            style={styles.snack}
            wrapperStyle={styles.snackWrapper}
          >
            <Paragraph
              style={{
                color: snackContent?.level === Level.ERROR ? Colors.Error : Colors.Black,
              }}
            >
              {snackContent?.text}
            </Paragraph>
          </Snackbar>
        </Portal>

        <NavigationContainer linking={linking} ref={navigationRef}>
          <drawer.Navigator
            screenOptions={{ headerShown: false, headerStyle: { backgroundColor: Colors.Primary } }}
            drawerContent={(props) => <DrawerContent {...props} />}
          >
            {screens.map((screen) => (
              <drawer.Screen
                key={screen.route}
                name={screen.route}
                component={screen.screen}
                options={{ unmountOnBlur: true, headerTintColor: Colors.White, title: "Onboarding | KYC Spider" }}
              />
            ))}
          </drawer.Navigator>
        </NavigationContainer>
      </Portal.Host>
    </Provider>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    height: "100%",
    padding: Sizes.AppPadding,
    backgroundColor: Colors.Grey,
  },
  snackWrapper: {
    bottom: Sizes.AppPadding,
    alignItems: "center",
  },
  snack: {
    maxWidth: 500,
    backgroundColor: Colors.White,
  },
});

export default Main;
