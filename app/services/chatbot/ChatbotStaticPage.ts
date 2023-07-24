import { ChatbotAnswer, ChatbotAPIConfirmations, ChatbotLanguageValues, ChatbotPage } from "../../models/ChatbotData";
import en from "./static-pages/en.json";
import de from "./static-pages/de.json";
import fr from "./static-pages/fr.json";
import { Environment } from "../../env/Environment";

export enum ChatbotStaticPage {
  START = "start",
  ALL_ANSWERS_CORRECT = "all_answers_correct",
  INFORM_OF_CHANGE_CONFIRMATION = "inform_of_change",
}

const availableLanguages = {
  en: en,
  de: de,
  fr: fr,
};

export const shouldExchangeWithStaticPage = (
  pages?: ChatbotPage[],
  confirmations?: ChatbotAPIConfirmations,
  answer?: ChatbotAnswer
): ChatbotStaticPage | undefined => {
  if (pages === undefined || pages.length === 0) {
    return ChatbotStaticPage.START;
  } else if (
    hasOnlyOneAnswerPossibility(answer) &&
    confirmations?.confirmsForm === "NO" &&
    confirmations?.informsOfChanges === "NO"
  ) {
    return ChatbotStaticPage.ALL_ANSWERS_CORRECT;
  } else if (
    hasOnlyOneAnswerPossibility(answer) &&
    confirmations?.confirmsForm === "YES" &&
    confirmations?.informsOfChanges === "NO"
  ) {
    return ChatbotStaticPage.INFORM_OF_CHANGE_CONFIRMATION;
  }
  return undefined;
};

export const createStaticPage = (page: ChatbotStaticPage, answer?: ChatbotAnswer): ChatbotPage => {
  return {
    header: retrieveValue(page, Property.HEADER),
    body: retrieveValue(page, Property.BODY),
    bodyHasSupportLink: page === ChatbotStaticPage.INFORM_OF_CHANGE_CONFIRMATION,
    answer: exchangeLanguageValues(page, answer),
  };
};

enum Property {
  HEADER,
  BODY,
  ANSWER,
}

const retrieveValue = (page: ChatbotStaticPage, property: Property): ChatbotLanguageValues => {
  const languageValues: ChatbotLanguageValues = {};
  Object.entries(availableLanguages).forEach(([key, value]) => {
    let retValue: string | null;
    switch (property) {
      case Property.HEADER:
        retValue = value[page].header;
        break;
      case Property.BODY:
        retValue = value[page].body;
        break;
      case Property.ANSWER:
        retValue = value[page].answer;
        break;
    }
    if (retValue) languageValues[key] = retValue.replace("{{name}}", Environment.mandator.name);
  });
  return languageValues;
};

const exchangeLanguageValues = (page: ChatbotStaticPage, answer?: ChatbotAnswer): ChatbotAnswer | undefined => {
  if (answer === undefined) {
    return answer;
  }
  let changedValues = retrieveValue(page, Property.ANSWER);
  if (Object.keys(changedValues).length !== 0 && answer.data.length > 0) {
    answer.data[0].label = changedValues;
  }
  return answer;
};

const hasOnlyOneAnswerPossibility = (answer?: ChatbotAnswer): boolean => {
  if (answer === undefined) {
    return false;
  }
  return answer.data.length === 1;
};
