import React, { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import { KycStatus, KycStep, KycStepName, KycStepStatus, UserInfo } from "../models/User";
import { useNavigation, useRoute } from "@react-navigation/native";
import NotificationService from "../services/NotificationService";
import { useTranslation } from "react-i18next";
import Routes from "../config/Routes";
import { getUser, putKyc } from "../services/ApiService";
import SettingsService from "../services/SettingsService";
import AuthService, { Session } from "../services/AuthService";
import withSession from "../hocs/withSession";
import KycInit from "../components/KycInit";
import { StyleSheet, View } from "react-native";
import { SpacerV } from "../elements/Spacers";
import { H2 } from "../elements/Texts";
import { DataTable, Paragraph } from "react-native-paper";
import { CompactCell, CompactRow } from "../elements/Tables";
import AppStyles from "../styles/AppStyles";
import ButtonContainer from "../components/util/ButtonContainer";
import { DfxButton } from "../elements/Buttons";
import DfxModal from "../components/util/DfxModal";
import KycDataEdit from "../components/edit/KycDataEdit";
import Iframe from "../components/util/Iframe";
import ChatbotScreen from "./ChatbotScreen";
import { groupBy, sleep } from "../utils/Utils";

const KycScreen = ({ session }: { session?: Session }) => {
  const { t } = useTranslation();
  const nav = useNavigation();
  const route = useRoute();

  // data
  const [userInfo, setUserInfo] = useState<UserInfo>();

  const getCurrentStep = (userInfo?: UserInfo): KycStep | undefined =>
    userInfo?.kycSteps.find((s) => s.status === KycStepStatus.IN_PROGRESS);

  const currentStep = getCurrentStep(userInfo);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isInProgress, setIsInProgress] = useState<boolean>(false);

  useEffect(() => {
    const params = route.params as any;
    if (!params?.ref) {
      onLoadFailed();
      return nav.navigate(Routes.NotFound);
    }

    AuthService.updateSession(params.ref);
  }, []);

  useEffect(() => {
    if (session) {
      // get user info
      getUser()
        .then((result) => {
          setUserInfo(result);
          if (result.language) SettingsService.updateSettings({ language: result.language.symbol });
        })
        .catch(onLoadFailed)
        .finally(() => setIsLoading(false));
    }
  }, [session]);

  const onLoadFailed = () => {
    NotificationService.error(t("feedback.load_failed"));
  };

  const continueKyc = () => {
    if (currentStep) {
      setIsInProgress(true);
    } else {
      setIsLoading(true);

      putKyc()
        .then(setUserInfo)
        .then(() => setIsInProgress(true))
        .catch(onLoadFailed)
        .finally(() => setIsLoading(false));
    }
  };

  const onChatBotFinished = (nthTry = 13): Promise<void> => {
    setIsLoading(true);

    return putKyc()
      .then((info: UserInfo) => {
        if (getCurrentStep(info)?.name === KycStepName.CHATBOT) {
          // retry
          if (nthTry > 1) {
            return sleep(5).then(() => onChatBotFinished(nthTry - 1));
          }

          throw Error();
        } else {
          setUserInfo(info);
          setIsLoading(false);
        }
      })
      .catch(() => {
        setIsLoading(false);
        NotificationService.error(t("model.kyc.chatbot_not_finished"));
      });
  };

  return (
    <AppLayout
      preventScrolling={currentStep?.name === KycStepName.CHATBOT}
      removeHeaderSpace={currentStep?.name === KycStepName.CHATBOT}
    >
      <KycInit isVisible={isLoading} setIsVisible={setIsLoading} />

      <DfxModal
        isVisible={isInProgress && currentStep?.name === KycStepName.USER_DATA}
        setIsVisible={setIsInProgress}
        title={t("model.user.edit")}
        style={{ width: 500 }}
      >
        <KycDataEdit onChanged={setUserInfo} />
      </DfxModal>

      {isInProgress && currentStep && currentStep.sessionUrl ? (
        <>
          <View style={styles.container}>
            {currentStep?.setupUrl && (
              <View style={styles.hiddenIframe}>
                <Iframe src={currentStep.setupUrl} />
              </View>
            )}
            {currentStep.name === KycStepName.CHATBOT ? (
              <View style={styles.container}>
                <ChatbotScreen sessionUrl={currentStep.sessionUrl} onFinish={onChatBotFinished} />
              </View>
            ) : (
              <Iframe src={currentStep.sessionUrl} />
            )}
          </View>
        </>
      ) : (
        <UserData userInfo={userInfo} onContinue={continueKyc} />
      )}
    </AppLayout>
  );
};

const UserData = ({ userInfo, onContinue }: { userInfo?: UserInfo; onContinue: () => void }) => {
  const { t } = useTranslation();

  const steps = Array.from(groupBy(userInfo?.kycSteps ?? [], "name").entries()).map(
    ([_, steps]) =>
      steps.find((s) => s.status === KycStepStatus.IN_PROGRESS) ??
      steps.find((s) => s.status === KycStepStatus.NOT_STARTED) ??
      steps.find((s) => s.status === KycStepStatus.COMPLETED) ??
      steps[0]
  );

  const continueLabel = (): string => {
    switch (userInfo?.kycStatus) {
      case KycStatus.NOT_STARTED:
        return "action.start";
      case KycStatus.IN_PROGRESS:
        return "action.continue";
      case KycStatus.PAUSED:
        return "action.resume";
      default:
        return "";
    }
  };

  return (
    <>
      <SpacerV height={30} />

      <View style={[AppStyles.containerHorizontal, styles.titleContainer]}>
        <H2 text={t("model.kyc.title")} />
        {userInfo && (
          <Paragraph>
            {t("model.kyc.status")}: {t(userInfo?.kycStatus ?? "")}
          </Paragraph>
        )}
      </View>

      <SpacerV />

      {userInfo && (
        <>
          <DataTable>
            {steps.map((step, i) => (
              <CompactRow key={i}>
                <CompactCell>{t(`model.kyc.step_name.${step.name}`)}</CompactCell>
                <CompactCell>{t(`model.kyc.step_status.${step.status}`)}</CompactCell>
              </CompactRow>
            ))}
          </DataTable>

          <SpacerV />

          {userInfo.kycStatus !== KycStatus.COMPLETED && (
            <ButtonContainer>
              <DfxButton mode="contained" onPress={onContinue}>
                {t(continueLabel())}
              </DfxButton>
            </ButtonContainer>
          )}
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    justifyContent: "space-between",
  },
  container: {
    flexDirection: "column",
    justifyContent: "space-between",
    flex: 1,
  },
  hiddenIframe: {
    height: 0,
    overflow: "hidden",
  },
});

export default withSession(KycScreen);
