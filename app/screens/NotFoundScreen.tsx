import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import AppLayout from "../components/AppLayout";
import { SpacerV } from "../elements/Spacers";
import { H1 } from "../elements/Texts";
import AppStyles from "../styles/AppStyles";
import { DfxButton } from "../elements/Buttons";
import { useNavigation } from "@react-navigation/native";
import Routes from "../config/Routes";

const NotFoundScreen = () => {
  const { t } = useTranslation();
  const nav = useNavigation();

  const createUser = () => {
    const randomRef = `random-${Math.floor(Math.random() * 1000000)}`;
    nav.navigate(Routes.Kyc, { ref: randomRef });
  };

  return (
    <AppLayout>
      <View style={[AppStyles.container, AppStyles.alignCenter]}>
        <H1 text={t("feedback.page_not_found")} />
        <SpacerV height={30} />
        <DfxButton onPress={createUser}>{t("model.user.new")}</DfxButton>
      </View>
    </AppLayout>
  );
};

export default NotFoundScreen;
