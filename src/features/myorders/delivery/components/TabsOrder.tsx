import { Box, Tab, Tabs } from '@mui/material';

export const TabsOrder = ({ tabValue, handleTabChange, orders }: { tabValue: any, handleTabChange: any, orders: any }) => {
    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="order status tabs"
                sx={{
                    '& .MuiTab-root': {
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '16px',
                        minHeight: 48
                    }
                }}
            >
                <Tab label={`Все (${orders?.data?.length || 0})`} />
                <Tab
                    label={`В обработке (${orders?.data?.filter(
                        (o: any) =>
                            o.status?.toLowerCase() === 'processing' ||
                            o.status?.toLowerCase() === 'in_progress' ||
                            o.status?.toLowerCase() === 'pending'
                    ).length || 0
                        })`}
                />
                <Tab
                    label={`Отправлен (${orders?.data?.filter((o: any) => o.status?.toLowerCase() === 'shipped')
                        .length || 0
                        })`}
                />
                <Tab
                    label={`Доставлен (${orders?.data?.filter(
                        (o: any) =>
                            o.status?.toLowerCase() === 'delivered' ||
                            o.status?.toLowerCase() === 'completed'
                    ).length || 0
                        })`}
                />
                <Tab
                    label={`Отменен (${orders?.data?.filter(
                        (o: any) =>
                            o.status?.toLowerCase() === 'cancelled' ||
                            o.status?.toLowerCase() === 'canceled'
                    ).length || 0
                        })`}
                />
            </Tabs>
        </Box>
    );
};
