import React, { useState } from "react";
import AppLayout from "../components/AppLayout";
import { KycInfo, KycStatus } from "../models/User";

const KycScreen = () => {
  // data
  const [kycInfo, setKycInfo] = useState<KycInfo>();

  return (
    <AppLayout
      preventScrolling={kycInfo?.kycStatus === KycStatus.CHATBOT}
      removeHeaderSpace={kycInfo?.kycStatus === KycStatus.CHATBOT}
    >
      TODO: KYC screen
    </AppLayout>
  );
};

export default KycScreen;
