import React, { useState } from "react";
import AppLayout from "../components/AppLayout";
import { UserInfo } from "../models/User";

const KycScreen = () => {
  // data
  const [userInfo, setUserInfo] = useState<UserInfo>();

  return (
    <AppLayout
    // preventScrolling={userInfo?.kycStatus === KycStatus.CHATBOT}
    // removeHeaderSpace={userInfo?.kycStatus === KycStatus.CHATBOT}
    >
      TODO: KYC screen
    </AppLayout>
  );
};

export default KycScreen;
