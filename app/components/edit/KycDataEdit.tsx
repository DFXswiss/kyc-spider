import React, { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SpacerH, SpacerV } from "../../elements/Spacers";
import { Country } from "../../models/Country";
import { UserInfo } from "../../models/User";
import { getCountries, postKycData } from "../../services/ApiService";
import AppStyles from "../../styles/AppStyles";
import DfxPicker from "../form/DfxPicker";
import Form from "../form/Form";
import Input from "../form/Input";
import PhoneNumber from "../form/PhoneNumber";
import Validations from "../../utils/Validations";
import NotificationService from "../../services/NotificationService";
import { Alert, H3, H4 } from "../../elements/Texts";
import { useDevice } from "../../hooks/useDevice";
import { DfxButton } from "../../elements/Buttons";
import ButtonContainer from "../util/ButtonContainer";
import { createRules } from "../../utils/Utils";
import { AccountType, KycData } from "../../models/KycData";
import Loading from "../util/Loading";

interface Props {
  onChanged: (info: UserInfo) => void;
}

const KycDataEdit = ({ onChanged }: Props) => {
  const { t } = useTranslation();
  const device = useDevice();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<KycData>({ defaultValues: { accountType: AccountType.PERSONAL } });
  const accountType = useWatch({ control, name: "accountType" });
  const country = useWatch({ control, name: "address.country" });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    getCountries()
      .then(setCountries)
      .catch(() => NotificationService.error(t("feedback.load_failed")))
      .finally(() => setIsLoading(false));
  }, []);

  const onSubmit = (updatedData: KycData) => {
    setIsSaving(true);
    setError(undefined);

    postKycData(updatedData)
      .then((info) => onChanged(info))
      .catch(() => setError(""))
      .finally(() => setIsSaving(false));
  };

  const rules: any = createRules({
    phone: Validations.Required,
    mail: [Validations.Mail, Validations.Required],

    accountType: Validations.Required,
    firstName: Validations.Required,
    lastName: Validations.Required,
    ["address.street"]: Validations.Required,
    ["address.houseNumber"]: Validations.Required,
    ["address.zip"]: Validations.Required,
    ["address.city"]: Validations.Required,
    ["address.country"]: Validations.Required,

    organizationName: Validations.Required,
    ["organizationAddress.street"]: Validations.Required,
    ["organizationAddress.houseNumber"]: Validations.Required,
    ["organizationAddress.city"]: Validations.Required,
    ["organizationAddress.zip"]: Validations.Required,
    ["organizationAddress.country"]: Validations.Required,
  });

  return isLoading ? (
    <Loading size="large" />
  ) : (
    <Form control={control} rules={rules} errors={errors} disabled={isSaving} onSubmit={handleSubmit(onSubmit)}>
      <SpacerV />
      <H3 text={t("model.user.kyc_data")} />

      <DfxPicker
        name="accountType"
        label={t("model.user.account_type")}
        items={Object.values(AccountType)}
        labelFunc={(i) => t(`model.user.account_type_name.${i}`)}
      />
      <SpacerV />

      {accountType !== AccountType.PERSONAL && <H4 text={t("model.user.personal_info")} />}

      <View style={AppStyles.containerHorizontalWrap}>
        <Input name="firstName" label={t("model.user.first_name")} />
        <SpacerH />
        <Input name="lastName" label={t("model.user.last_name")} />
      </View>
      <SpacerV />

      <View style={AppStyles.containerHorizontalWrap}>
        <Input name="address.street" label={t("model.user.street")} />
        <SpacerH />
        <Input name="address.houseNumber" label={t("model.user.house_number")} />
      </View>
      <SpacerV />

      <View style={AppStyles.containerHorizontalWrap}>
        <Input name="address.zip" label={t("model.user.zip")} />
        <SpacerH />
        <Input name="address.city" label={t("model.user.city")} />
      </View>
      <SpacerV />

      <DfxPicker
        name="address.country"
        label={t("model.user.country")}
        items={countries}
        idFunc={(i) => i.id}
        labelFunc={(i) => i.name}
      />
      <SpacerV />

      {accountType !== AccountType.PERSONAL && (
        <>
          <H4 text={t("model.user.organization_info")} />
          <Input name="organizationName" label={t("model.user.organization_name")} />
          <SpacerV />

          <View style={AppStyles.containerHorizontalWrap}>
            <Input name="organizationAddress.street" label={t("model.user.street")} />
            <SpacerH />
            <Input name="organizationAddress.houseNumber" label={t("model.user.house_number")} />
          </View>
          <SpacerV />

          <View style={AppStyles.containerHorizontalWrap}>
            <Input name="organizationAddress.zip" label={t("model.user.zip")} />
            <SpacerH />
            <Input name="organizationAddress.city" label={t("model.user.city")} />
          </View>
          <SpacerV />

          <DfxPicker
            name="organizationAddress.country"
            label={t("model.user.country")}
            items={countries}
            idFunc={(i) => i.id}
            labelFunc={(i) => i.name}
          />
          <SpacerV />
        </>
      )}

      <H3 text={t("model.user.contact_data")} />

      <Input name="mail" label={t("model.user.mail")} valueHook={(v: string) => v.trim()} />
      <SpacerV />

      <PhoneNumber
        name="phone"
        label={t("model.user.mobile_number")}
        placeholder="1761212112"
        wrap={!device.SM}
        country={country?.symbol}
      />
      <SpacerV />

      {error != null && (
        <>
          <Alert label={`${t("feedback.save_failed")} ${error ? t(error) : ""}`} />
          <SpacerV />
        </>
      )}

      <ButtonContainer>
        <DfxButton mode="contained" loading={isSaving} onPress={handleSubmit(onSubmit)}>
          {t("action.save")}
        </DfxButton>
      </ButtonContainer>
    </Form>
  );
};

export default KycDataEdit;
