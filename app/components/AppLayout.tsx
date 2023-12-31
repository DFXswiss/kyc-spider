import React, { createRef, ReactNode, RefObject, useState } from "react";
import { ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { FAB, Portal } from "react-native-paper";
import Colors from "../config/Colors";
import Sizes from "../config/Sizes";
import { SpacerV } from "../elements/Spacers";
import { AppSettings } from "../services/SettingsService";
import AppStyles from "../styles/AppStyles";
import Header from "./Header";
import { useDevice } from "../hooks/useDevice";

interface AppLayoutProps {
  settings?: AppSettings;
  preventScrolling?: boolean;
  removeHeaderSpace?: boolean;
  children: ReactNode;
}

const AppLayout = ({ preventScrolling, removeHeaderSpace, children }: AppLayoutProps) => {
  const dimensions = useWindowDimensions();
  const device = useDevice();
  const [contentSize, setContentSize] = useState(0);
  const [contentOffset, setContentOffset] = useState(0);

  const scrollPosition = contentSize - contentOffset - dimensions.height;
  const scrollRef: RefObject<ScrollView> = createRef();

  const styles = StyleSheet.create({
    scrollContainer: {
      minHeight: "100%",
    },
    scrollContainerPage: {
      minHeight: "100%",
      maxHeight: "100%",
    },
    container: {
      alignItems: "center",
      padding: Sizes.AppPadding,
    },
    headerContainer: {
      alignItems: "center",
      paddingHorizontal: Sizes.AppPadding,
      paddingVertical: device.SM ? Sizes.AppPadding : Sizes.AppPadding / 2,
      backgroundColor: Colors.White,
    },
    appContainer: {
      width: "100%",
      maxWidth: Sizes.AppWidth,
    },
    fab: {
      position: "absolute",
      margin: 16,
      bottom: 0,
    },
  });

  return (
    <View style={{ height: dimensions.height }}>
      <Portal.Host>
        <ScrollView
          contentContainerStyle={preventScrolling ? styles.scrollContainerPage : styles.scrollContainer}
          ref={scrollRef}
          onContentSizeChange={(_, height) => setContentSize(height)}
          onScroll={(scrollEvent) => setContentOffset(scrollEvent.nativeEvent.contentOffset.y)}
          scrollEventThrottle={100}
        >
          <View style={[styles.headerContainer]}>
            <Header />
          </View>
          <View style={[AppStyles.container, styles.container]}>
            <View style={[AppStyles.container, styles.appContainer]}>
              {!removeHeaderSpace && <SpacerV height={20} />}
              {children}
              <Portal>
                <FAB
                  icon="chevron-down"
                  style={[styles.fab, { right: Math.max(0, (dimensions.width - Sizes.AppWidth) / 2) }]}
                  onPress={() => scrollRef.current?.scrollToEnd({ animated: true })}
                  visible={contentSize > 3000 && scrollPosition > 250}
                />
              </Portal>
            </View>
          </View>
        </ScrollView>
      </Portal.Host>
    </View>
  );
};

export default AppLayout;
