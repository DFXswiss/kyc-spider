import React from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import AppStyles from "../styles/AppStyles";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { IconButton } from "react-native-paper";
import { useDevice } from "../hooks/useDevice";
import HeaderContent from "./HeaderContent";
import Sizes from "../config/Sizes";

const Header = () => {
  const device = useDevice();
  const nav = useNavigation<DrawerNavigationProp<any>>();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      width: "100%",
      maxWidth: Sizes.AppWidth,
    },
    logoContainer: {
      flex: 1,
      flexDirection: "row",
      justifyContent: device.SM ? "flex-start" : "flex-end",
    },
    logoTouch: {
      width: 300,
      height: 40,
      flexShrink: 1,
    },
    logo: {
      flex: 1,
      resizeMode: "contain",
    },
  });

  return (
    <View style={[AppStyles.containerHorizontal, styles.container]}>
      {!device.SM && <IconButton icon="menu" onPress={() => nav.toggleDrawer()} style={{ marginRight: 10 }} />}

      <View style={styles.logoContainer}>
        <TouchableOpacity activeOpacity={1} style={styles.logoTouch}>
          <Image style={styles.logo} source={require("../assets/kyc-spider-logo.png")} />
        </TouchableOpacity>
      </View>

      <View style={[styles.container, !device.SM && AppStyles.noDisplay]}>
        <HeaderContent />
      </View>
    </View>
  );
};

export default Header;
