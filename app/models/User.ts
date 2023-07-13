export enum KycStatus {
  NA = "NA",
  CHATBOT = "Chatbot",
  ONLINE_ID = "OnlineId",
  VIDEO_ID = "VideoId",
  CHECK = "Check",
  COMPLETED = "Completed",
  REJECTED = "Rejected",
}

export enum AccountType {
  PERSONAL = "Personal",
  BUSINESS = "Business",
  SOLE_PROPRIETORSHIP = "SoleProprietorship",
}

export interface KycInfo {
  kycStatus: KycStatus;
}
