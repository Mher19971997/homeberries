export type CompanyAddress = {
  uuid: string;
  address: string;
  latitude: number;
  longitude: number;
};

export type CompanyCatalog = {
  uuid: string;
  name: string;
  description?: string;
  price: number;
  images?: { url: string }[];
};

export type Company = {
  uuid: string;
  name: string;
  description?: string;
  addresses?: CompanyAddress[];
  catalogs?: CompanyCatalog[];
};
