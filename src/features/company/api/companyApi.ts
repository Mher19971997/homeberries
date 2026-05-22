import axios from "axios";
import { Company } from "@homeberris/features/company/types";

export const getCompany = async (uuid: string): Promise<{ data: Company }> => {
    const response = await axios.get(`/api/company/${uuid}`);
    return response.data;
};
