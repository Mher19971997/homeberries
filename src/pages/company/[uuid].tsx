import { Box, Typography, Grid } from "@mui/material";
import { useCompany } from "@homeberris/features/company/hooks/useCompany";
import { CompanyHeader } from "@homeberris/features/company/components/CompanyHeader";
import { CompanyAddress } from "@homeberris/features/company/components/CompanyAddress";
import { CompanyCatalog } from "@homeberris/features/company/components/CompanyCatalog";
import { useRouter } from "next/router";

export default function CompanyPage() {
  const router = useRouter();
  const { uuid } = router.query;

  const { data: companyResponse } = useCompany(uuid as string);
  const company = companyResponse?.data;

  if (!company) return <Typography>Загрузка...</Typography>;

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: "auto" }}>
      <CompanyHeader company={company} />

      {company.addresses && company.addresses.length > 0 && (
        <Box mb={4}>
          <Typography variant="h5" mb={2}>
            Адреса магазинов
          </Typography>
          {company.addresses.map((address) => (
            <CompanyAddress key={address.uuid} address={address} />
          ))}
        </Box>
      )}

      {company.catalogs && company.catalogs.length > 0 ? (
        <>
          <Typography variant="h5" mb={3}>
            Каталоги
          </Typography>
          <Grid container spacing={3}>
            {company.catalogs.map((catalog) => (
              <CompanyCatalog key={catalog.uuid} catalog={catalog} />
            ))}
          </Grid>
        </>
      ) : (
        <Typography variant="h6" color="text.secondary">
          У этой компании пока нет каталогов
        </Typography>
      )}
    </Box>
  );
}
