import { Country } from "./Country";

export enum AccountType {
  PERSONAL = "Personal",
  BUSINESS = "Business",
  SOLE_PROPRIETORSHIP = "SoleProprietorship",
}

export interface Address {
  street: string;
  houseNumber: string;
  city: string;
  zip: string;
  country: Country;
}

export interface KycData {
  accountType: AccountType;
  mail: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: Address;
  organizationName: string;
  organizationAddress: Address;
}
