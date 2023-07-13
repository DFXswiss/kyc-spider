import React, { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import { UserInfo } from "../models/User";
import { useNavigation, useRoute } from "@react-navigation/native";
import NotificationService from "../services/NotificationService";
import { useTranslation } from "react-i18next";
import Routes from "../config/Routes";
import { getUser } from "../services/ApiService";
import SettingsService from "../services/SettingsService";
import AuthService, { Session } from "../services/AuthService";
import withSession from "../hocs/withSession";

const KycScreen = ({ session }: { session?: Session }) => {
  const { t } = useTranslation();
  const nav = useNavigation();
  const route = useRoute();

  // data
  const [userInfo, setUserInfo] = useState<UserInfo>();

  // UI state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = route.params as any;
    if (!params?.ref) return onLoadFailed();

    AuthService.updateSession(params.ref);
  }, []);

  useEffect(() => {
    if (session) {
      console.log(session);

      // get user info
      getUser().then((result) => {
        setUserInfo(result);
        if (result.language) SettingsService.updateSettings({ language: result.language.symbol });

        setIsLoading(false);
      });
      // .catch(onLoadFailed);
    }
  }, [session]);

  const onLoadFailed = () => {
    NotificationService.error(t("feedback.load_failed"));
    nav.navigate(Routes.NotFound);
  };

  return (
    <AppLayout
    // preventScrolling={userInfo?.kycStatus === KycStatus.CHATBOT}
    // removeHeaderSpace={userInfo?.kycStatus === KycStatus.CHATBOT}
    >
      <p>TODO: KYC screen</p>
      <p>KYC status: {userInfo?.kycStatus}</p>
    </AppLayout>
  );
};

export default withSession(KycScreen);
