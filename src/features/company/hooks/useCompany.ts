import { useQuery } from "react-query";
import { getCompany } from "@homeberris/features/company/api/companyApi";
import { Company } from "@homeberris/features/company/types";

export const useCompany = (uuid?: string) => {
  return useQuery<{ data: Company }>(
    ["getCompany", uuid],
    () => getCompany(uuid as string),
    {
      enabled: !!uuid,
    }
  );
};
