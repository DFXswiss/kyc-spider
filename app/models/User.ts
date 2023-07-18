import { Language } from "./Language";

export enum KycStatus {
  NOT_STARTED = "NotStarted",
  IN_PROGRESS = "InProgress",
  COMPLETED = "Completed",
  PAUSED = "Paused",
}

export enum KycStepName {
  USER_DATA = "UserData",
  INCORP_CERT = "IncorpCert",
  CHATBOT = "Chatbot",
  ONLINE_ID = "OnlineId",
  VIDEO_ID = "VideoId",
}

export enum KycStepStatus {
  NOT_STARTED = "NotStarted",
  IN_PROGRESS = "InProgress",
  FAILED = "Failed",
  COMPLETED = "Completed",
}

export interface KycStep {
  name: KycStepName;
  status: KycStepStatus;
  sessionUrl?: string;
  setupUrl?: string;
  sessionId?: string;
}

export interface UserInfo {
  language: Language;
  kycStatus: KycStatus;
  kycSteps: KycStep[];
}

export interface Settings {
  language?: Language;
  mail?: string;
  phone?: string;
}
