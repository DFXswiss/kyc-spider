import { Environment } from "../env/Environment";
import { ApiError } from "../models/ApiDto";
import { Language } from "../models/Language";

const BaseUrl = Environment.api.baseUrl;
const LanguageUrl = "language";
const UserUrl = "kyc";

// --- KYC --- //

// --- LANGUAGE --- //
export const getLanguages = (): Promise<Language[]> => {
  return fetchFrom<Language[]>(LanguageUrl);
};

// --- HELPERS --- //
const postFiles = (url: string, files: File[]): Promise<void> => {
  const formData = new FormData();
  for (const key in files) {
    formData.append("files", files[key]);
  }
  return fetchFrom(url, "POST", formData, true);
};

const fetchFrom = <T>(
  url: string,
  method: "GET" | "PUT" | "POST" | "DELETE" = "GET",
  data?: any,
  noJson?: boolean
): Promise<T> => {
  return (
    fetch(`${BaseUrl}/${url}`, buildInit(method, data, noJson))
      .then((response) => {
        if (response.ok) {
          return response.json().catch(() => undefined);
        }
        return response.json().then((body) => {
          throw body;
        });
      })
      // TODO: this throws state update error (on HomeScreen)
      .catch((error: ApiError) => {
        throw error;
      })
  );
};

const buildInit = (method: "GET" | "PUT" | "POST" | "DELETE", data?: any, noJson?: boolean): RequestInit => ({
  method: method,
  headers: {
    ...(noJson ? undefined : { "Content-Type": "application/json" }),
  },
  body: noJson ? data : JSON.stringify(data),
});
