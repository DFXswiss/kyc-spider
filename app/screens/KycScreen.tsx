import React, { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import { KycStatus, KycStep, KycStepName, KycStepStatus, UserInfo } from "../models/User";
import { useNavigation, useRoute } from "@react-navigation/native";
import NotificationService from "../services/NotificationService";
import { useTranslation } from "react-i18next";
import Routes from "../config/Routes";
import { getUser, postIncorporationCertificate, putKyc } from "../services/ApiService";
import SettingsService from "../services/SettingsService";
import AuthService, { Session } from "../services/AuthService";
import withSession from "../hocs/withSession";
import KycInit from "../components/KycInit";
import { StyleSheet, View } from "react-native";
import { SpacerV } from "../elements/Spacers";
import { H1, H3 } from "../elements/Texts";
import { DataTable, Dialog, IconButton, Paragraph, Portal, Text } from "react-native-paper";
import { CompactCell, CompactRow } from "../elements/Tables";
import AppStyles from "../styles/AppStyles";
import ButtonContainer from "../components/util/ButtonContainer";
import { DfxButton } from "../elements/Buttons";
import DfxModal from "../components/util/DfxModal";
import KycDataEdit from "../components/edit/KycDataEdit";
import Iframe from "../components/util/Iframe";
import ChatbotScreen from "./ChatbotScreen";
import { groupBy, pickDocuments, sleep } from "../utils/Utils";
import Colors from "../config/Colors";
import { ApiError } from "../models/ApiDto";
import { useDevice } from "../hooks/useDevice";
import ContactDataEdit from "../components/edit/ContactDataEdit";
import Sizes from "../config/Sizes";

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
  const [isCoiUploading, setIsCoiUploading] = useState(false);
  const [iframeWidth, setIframeWidth] = useState(Sizes.AppWidth);

  useEffect(() => {
    const params = route.params as any;
    if (!params?.ref) return userNotFound();

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
        .catch((e: ApiError) => (e.statusCode === 401 ? userNotFound() : onLoadFailed))
        .finally(() => setIsLoading(false));
    }
  }, [session]);

  const userNotFound = () => nav.navigate(Routes.NotFound);

  const onLoadFailed = () => NotificationService.error(t("feedback.load_failed"));

  const continueKyc = (): void | Promise<void> => {
    if (currentStep) {
      setIsInProgress(true);
      if ([KycStepName.ONLINE_ID, KycStepName.VIDEO_ID].includes(currentStep.name)) {
        // show spinner (loading the iframe takes some time)
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 5000);
      }
    } else {
      setIsLoading(true);

      return putKyc()
        .then(setUserInfo)
        .then(() => setIsInProgress(true))
        .catch(onLoadFailed)
        .finally(() => setIsLoading(false));
    }
  };

  const uploadCoi = (): Promise<void> => {
    return pickDocuments({ type: "public.item", multiple: false })
      .then((files) => {
        setIsCoiUploading(true);
        return postIncorporationCertificate(files);
      })
      .then(setUserInfo)
      .catch(() => NotificationService.error(t("feedback.file_error")))
      .finally(() => setIsCoiUploading(false));
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
        NotificationService.error(t("model.kyc.bot.not_finished"));
      });
  };

  return (
    <AppLayout
      preventScrolling={currentStep?.name === KycStepName.CHATBOT}
      removeHeaderSpace={isInProgress && currentStep?.sessionUrl != null}
    >
      <KycInit isVisible={isLoading} setIsVisible={setIsLoading} />

      <DfxModal
        isVisible={isInProgress && currentStep?.name === KycStepName.USER_DATA}
        setIsVisible={setIsInProgress}
        title={t("model.user.edit")}
        style={{ width: 500 }}
        dismissable={false}
      >
        <KycDataEdit onChanged={setUserInfo} />
      </DfxModal>

      <Portal>
        <Dialog
          visible={isInProgress && currentStep?.name === KycStepName.INCORP_CERT}
          onDismiss={() => setIsInProgress(false)}
          style={AppStyles.dialog}
        >
          <Dialog.Content>
            <Paragraph>{t("model.kyc.upload_certificate")}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <DfxButton onPress={uploadCoi} loading={isCoiUploading}>
              {t("action.upload")}
            </DfxButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {isInProgress && currentStep?.sessionUrl ? (
        <>
          <View style={styles.container} onLayout={(e) => setIframeWidth(e.nativeEvent.layout.width)}>
            <View style={[AppStyles.containerHorizontal]}>
              <View style={[AppStyles.mla, { marginVertical: -6, marginRight: -6 }]}>
                <IconButton icon="close" color={Colors.Primary} onPress={() => setIsInProgress(false)} />
              </View>
            </View>
            {currentStep.setupUrl && (
              <View style={styles.hiddenIframe}>
                <Iframe src={currentStep.setupUrl} width={iframeWidth} height={800} />
              </View>
            )}
            {currentStep.name === KycStepName.CHATBOT ? (
              <View style={styles.container}>
                <ChatbotScreen sessionUrl={currentStep.sessionUrl} onFinish={onChatBotFinished} />
              </View>
            ) : (
              <Iframe src={currentStep.sessionUrl} width={iframeWidth} height={900} />
            )}
          </View>
        </>
      ) : (
        <UserData userInfo={userInfo} onChanged={setUserInfo} onContinue={continueKyc} />
      )}
    </AppLayout>
  );
};

const UserData = ({
  userInfo,
  onChanged,
  onContinue,
}: {
  userInfo?: UserInfo;
  onChanged: (info: UserInfo) => void;
  onContinue: () => void;
}) => {
  const { t } = useTranslation();
  const device = useDevice();

  const [isUserEdit, setIsUserEdit] = useState(false);

  const stepsToDisplay = Array.from(groupBy(userInfo?.kycSteps ?? [], "name").entries()).map(
    ([_, steps]) =>
      steps.find((s) => s.status === KycStepStatus.IN_PROGRESS) ??
      steps.find((s) => s.status === KycStepStatus.NOT_STARTED) ??
      steps.find((s) => s.status === KycStepStatus.COMPLETED) ??
      steps[0]
  );

  const statusLabel = t("model.kyc.status") + ": " + t(`model.kyc.status_name.${userInfo?.kycStatus}`);

  const continueLabel = (): string => {
    switch (userInfo?.kycStatus) {
      case KycStatus.NOT_STARTED:
        return "action.start";
      case KycStatus.IN_PROGRESS:
        return "action.next";
      case KycStatus.PAUSED:
        return "action.resume";
      default:
        return "";
    }
  };

  const statusColor = (step: KycStep): string | undefined => {
    switch (step.status) {
      case KycStepStatus.NOT_STARTED:
        return Colors.Disabled;
      case KycStepStatus.COMPLETED:
        return Colors.Success;
      case KycStepStatus.FAILED:
        return Colors.Error;
      default:
        return undefined;
    }
  };

  const isEditable = (step: KycStep): boolean => {
    return step.name === KycStepName.USER_DATA && step.status === KycStepStatus.COMPLETED;
  };

  const userEdited = (info: UserInfo) => {
    onChanged(info);
    setIsUserEdit(false);
  };

  return (
    <>
      <DfxModal
        isVisible={isUserEdit}
        setIsVisible={setIsUserEdit}
        title={t("model.user.edit_contact")}
        style={{ width: 500 }}
      >
        <ContactDataEdit onChanged={userEdited} />
      </DfxModal>

      <View style={AppStyles.alignCenter}>
        <H1 text={t("model.kyc.title")} />
      </View>
      <SpacerV height={30} />

      {userInfo && (
        <>
          <H3 text={statusLabel} />
          <SpacerV />

          <DataTable>
            {stepsToDisplay.map((step) => (
              <CompactRow
                key={step.name}
                style={{ minHeight: 37 }}
                onPress={isEditable(step) && !device.SM ? () => setIsUserEdit(true) : undefined}
              >
                <CompactCell multiLine>{t(`model.kyc.step_name.${step.name}`)}</CompactCell>
                <View style={{ flex: device.SM ? 2 : 1, flexDirection: "row" }}>
                  <CompactCell multiLine>
                    <Text style={{ color: statusColor(step) }}>{t(`model.kyc.step_status.${step.status}`)}</Text>
                  </CompactCell>
                  {isEditable(step) && (
                    <CompactCell style={{ flex: undefined }}>
                      <IconButton
                        color={Colors.Primary}
                        icon="account-edit-outline"
                        onPress={() => setIsUserEdit(true)}
                        style={{ margin: 0 }}
                      />
                    </CompactCell>
                  )}
                </View>
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
  container: {
    flexDirection: "column",
    flex: 1,
  },
  hiddenIframe: {
    height: 0,
    overflow: "hidden",
  },
});

export default withSession(KycScreen);
