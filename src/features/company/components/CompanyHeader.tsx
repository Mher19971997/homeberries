import { Box, Typography } from "@mui/material";
import { Company } from "@homeberris/features/company/types";

export const CompanyHeader = ({ company }: { company: Company }) => (
    <Box mb={4}>
        <Typography variant="h3" fontWeight="bold" mb={2}>
            {company.name}
        </Typography>
        {company.description && (
            <Typography variant="body1" color="text.secondary">
                {company.description}
            </Typography>
        )}
    </Box>
);
