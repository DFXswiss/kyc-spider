import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SpacerV } from "../../elements/Spacers";
import { UserInfo } from "../../models/User";
import { putUser } from "../../services/ApiService";
import Form from "../form/Form";
import Input from "../form/Input";
import PhoneNumber from "../form/PhoneNumber";
import Validations from "../../utils/Validations";
import { Alert } from "../../elements/Texts";
import { useDevice } from "../../hooks/useDevice";
import { DfxButton } from "../../elements/Buttons";
import ButtonContainer from "../util/ButtonContainer";
import { createRules } from "../../utils/Utils";
import { KycData } from "../../models/KycData";

interface Props {
  onChanged: (info: UserInfo) => void;
}

const ContactDataEdit = ({ onChanged }: Props) => {
  const { t } = useTranslation();
  const device = useDevice();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<KycData>();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();

  const onSubmit = (updatedData: KycData) => {
    setIsSaving(true);
    setError(undefined);

    putUser(updatedData)
      .then((info) => onChanged(info))
      .catch(() => setError(""))
      .finally(() => setIsSaving(false));
  };

  const rules: any = createRules({
    mail: [Validations.Mail],
  });

  return (
    <Form control={control} rules={rules} errors={errors} disabled={isSaving} onSubmit={handleSubmit(onSubmit)}>
      <SpacerV />

      <Input name="mail" label={t("model.user.mail")} valueHook={(v: string) => (v ? v.trim() : null)} />
      <SpacerV />

      <PhoneNumber name="phone" label={t("model.user.mobile_number")} placeholder="1761212112" wrap={!device.SM} />
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

export default ContactDataEdit;
