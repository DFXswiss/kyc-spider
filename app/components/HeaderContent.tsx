import React, { SetStateAction, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { DfxButton } from "../elements/Buttons";
import { Environment } from "../env/Environment";
import withSettings from "../hocs/withSettings";
import { useDevice } from "../hooks/useDevice";
import { Language } from "../models/Language";
import SettingsService, { AppSettings } from "../services/SettingsService";
import AppStyles from "../styles/AppStyles";
import { resolve, openUrl } from "../utils/Utils";
import DfxDropdown from "./form/DfxDropdown";
import { putUser } from "../services/ApiService";
import { Session } from "../services/AuthService";
import withSession from "../hocs/withSession";

const HeaderContent = ({
  settings,
  session,
  drawer,
}: {
  settings?: AppSettings;
  session?: Session;
  drawer?: boolean;
}) => {
  const { t } = useTranslation();
  const device = useDevice();

  const [selectedLanguage, setSelectedLanguage] = useState(Environment.defaultLanguage);

  useEffect(() => {
    if (settings) {
      setSelectedLanguage(settings.language);
    }
  }, [settings]);

  const getLanguage = (symbol: string): Language | undefined =>
    SettingsService.Languages.find((l) => l.symbol === symbol);
  const languageChanged = (update: SetStateAction<Language | undefined>) => {
    const language = resolve(update, getLanguage(selectedLanguage));
    if (language) {
      SettingsService.updateSettings({ language: language.symbol });

      if (session?.isLoggedIn) {
        putUser({ language });
      }
    }
  };

  const links: { key: string; url: string }[] = [];

  return (
    <View style={device.SM && [AppStyles.containerHorizontalWrap, styles.container]}>
      {links.map((link) => (
        <DfxButton key={link.key} onPress={() => openUrl(link.url)} style={styles.button} compact header={!drawer}>
          {t(link.key)}
        </DfxButton>
      ))}

      {SettingsService.Languages?.length > 0 && (
        <DfxDropdown
          value={getLanguage(selectedLanguage)}
          setValue={languageChanged}
          items={SettingsService.Languages}
          idProp="symbol"
          labelProp="foreignName"
          title={t("general.select_language")}
          style={styles.button}
          mode={drawer ? "contained" : "outlined"}
        ></DfxDropdown>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "flex-end",
  },
  button: {
    alignSelf: "flex-start",
  },
});

export default withSession(withSettings(HeaderContent));
