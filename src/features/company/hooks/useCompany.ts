import { useQuery } from "@tanstack/react-query";
import { getCompany } from "@homeberris/features/company/api/companyApi";
import { Company } from "@homeberris/features/company/types";

export const useCompany = (uuid?: string) => {
  return useQuery<{ data: Company }>({
    queryKey: ["getCompany", uuid],
    queryFn: () => getCompany(uuid as string),
    enabled: !!uuid,
  });
};
