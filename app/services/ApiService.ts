import { Environment } from "../env/Environment";
import { ApiError } from "../models/ApiDto";
import { Country } from "../models/Country";
import { KycData } from "../models/KycData";
import { Language } from "../models/Language";
import { Settings, UserInfo } from "../models/User";
import AuthService, { Session } from "./AuthService";

const BaseUrl = Environment.api.baseUrl;
const LanguageUrl = "language";
const UserUrl = "user";

// --- KYC --- //

export const getUser = (): Promise<UserInfo> => {
  return fetchFrom<UserInfo>(UserUrl);
};

export const putUser = (settings: Settings): Promise<any> => {
  return fetchFrom<UserInfo>(UserUrl, "PUT", settings);
};

export const getCountries = (): Promise<Country[]> => {
  return fetchFrom<Country[]>(`${UserUrl}/countries`);
};

export const putKyc = (): Promise<UserInfo> => {
  return fetchFrom<UserInfo>(`${UserUrl}/kyc`, "PUT");
};

export const postKycData = (data: KycData): Promise<UserInfo> => {
  return fetchFrom<UserInfo>(`${UserUrl}/data`, "POST", data);
};

export const postIncorporationCertificate = (files: File[]): Promise<UserInfo> => {
  return postFiles<UserInfo>(`${UserUrl}/incorporation-certificate`, files);
};

// --- LANGUAGE --- //
export const getLanguages = (): Promise<Language[]> => {
  return fetchFrom<Language[]>(LanguageUrl);
};

// --- HELPERS --- //
const postFiles = <T>(url: string, files: File[]): Promise<T> => {
  const formData = new FormData();
  for (const key in files) {
    formData.append("files", files[key]);
  }
  return fetchFrom<T>(url, "POST", formData, true);
};

const fetchFrom = <T>(
  url: string,
  method: "GET" | "PUT" | "POST" | "DELETE" = "GET",
  data?: any,
  noJson?: boolean,
  rawResponse?: boolean
): Promise<T> => {
  const init = buildInit(method, AuthService.Session, data, noJson);
  return (
    fetch(`${BaseUrl}/${url}`, init)
      .then((response) => {
        if (response.ok) {
          return rawResponse ? response : response.json().catch(() => undefined);
        }
        return response.json().then((body) => {
          throw body;
        });
      })
      // TODO: this throws state update error (on HomeScreen)
      .catch((error: ApiError) => {
        if (error.statusCode === 401) {
          AuthService.deleteSession();
        }

        throw error;
      })
  );
};

const buildInit = (
  method: "GET" | "PUT" | "POST" | "DELETE",
  session?: Session,
  data?: any,
  noJson?: boolean
): RequestInit => ({
  method: method,
  headers: {
    ...(noJson ? undefined : { "Content-Type": "application/json" }),
    Authorization: session?.accessToken ? "Bearer " + session.accessToken : "",
  },
  body: noJson ? data : JSON.stringify(data),
});
