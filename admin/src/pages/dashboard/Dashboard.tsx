import {
  AttachMoney,
  ExpandMore,
  People,
  ShoppingCart,
  TrendingUp,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  styled,
  Typography,
  useTheme,
} from "@mui/material";
import { BarChart, PieChart } from "@mui/x-charts";

// Custom styled components
const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  borderRadius: "12px",
  boxShadow: theme.shadows[6],
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[12],
  },
}));

const StatCard = ({
  title,
  value,
  icon,
  color,
  trend,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}) => (
  <GradientCard sx={{ backgroundColor: color }}>
    <CardContent>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <div>
          <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
            {value}
          </Typography>
          {trend && (
            <Typography
              variant="caption"
              sx={{ display: "flex", alignItems: "center", mt: 1 }}
            >
              <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
              {trend}
            </Typography>
          )}
        </div>
        <Avatar
          sx={{
            backgroundColor: "rgba(255,255,255,0.2)",
            width: 48,
            height: 48,
            "& .MuiSvgIcon-root": { fontSize: 24 },
          }}
        >
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </GradientCard>
);

// Sample data
const salesData = [
  { month: "Jan", value: 4000 },
  { month: "Feb", value: 3000 },
  { month: "Mar", value: 6000 },
  { month: "Apr", value: 8000 },
  { month: "May", value: 5000 },
  { month: "Jun", value: 9000 },
];

const revenueData = [
  { id: 0, value: 60, label: "Products" },
  { id: 1, value: 25, label: "Services" },
  { id: 2, value: 15, label: "Subscriptions" },
];

const recentOrders = [
  { id: "#ORD-001", customer: "John Doe", amount: "$120", status: "Completed" },
  {
    id: "#ORD-002",
    customer: "Jane Smith",
    amount: "$85",
    status: "Processing",
  },
  {
    id: "#ORD-003",
    customer: "Robert Johnson",
    amount: "$220",
    status: "Completed",
  },
  { id: "#ORD-004", customer: "Emily Davis", amount: "$54", status: "Pending" },
  {
    id: "#ORD-005",
    customer: "Michael Brown",
    amount: "$189",
    status: "Completed",
  },
];

const Dashboard = () => {
  const theme = useTheme();

  return (
    <Box sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
      {/* Content Area */}
      <Box sx={{ flex: 1 }}>
        <Grid container spacing={3}>
          {/* Quick Stats */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Sales"
              value="$24.5k"
              icon={<AttachMoney />}
              color={theme.palette.primary.main}
              trend="12% increase"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="New Orders"
              value="1,234"
              icon={<ShoppingCart />}
              color={theme.palette.secondary.main}
              trend="8% increase"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Users"
              value="2,345"
              icon={<People />}
              color={theme.palette.success.main}
              trend="5% increase"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Conversion Rate"
              value="3.2%"
              icon={<TrendingUp />}
              color={theme.palette.warning.main}
              trend="1.2% increase"
            />
          </Grid>

          {/* Charts */}
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2] }}>
              <CardHeader
                title="Sales Overview"
                subheader="Monthly performance"
                action={
                  <IconButton>
                    <ExpandMore />
                  </IconButton>
                }
              />
              <CardContent sx={{ pt: 0 }}>
                <Box height={300}>
                  <BarChart
                    series={[
                      {
                        data: salesData.map((item) => item.value),
                        color: theme.palette.primary.main,
                      },
                    ]}
                    xAxis={[
                      {
                        scaleType: "band",
                        data: salesData.map((item) => item.month),
                      },
                    ]}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2] }}>
              <CardHeader title="Revenue Sources" subheader="This month" />
              <CardContent>
                <Box height={300}>
                  <PieChart
                    series={[
                      {
                        data: revenueData,
                        innerRadius: 50,
                        outerRadius: 100,
                        paddingAngle: 5,
                        cornerRadius: 5,
                        highlightScope: {
                          faded: "global",
                          highlighted: "item",
                        },
                        faded: {
                          innerRadius: 30,
                          additionalRadius: -30,
                          color: "gray",
                        },
                      },
                    ]}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Orders */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2] }}>
              <CardHeader
                title="Recent Orders"
                subheader={`${recentOrders.length} new orders`}
              />
              <CardContent sx={{ p: 0 }}>
                <List>
                  {recentOrders.map((order, index) => (
                    <Box key={order.id}>
                      <ListItem
                        secondaryAction={
                          <Typography
                            color={
                              order.status === "Completed"
                                ? "success.main"
                                : order.status === "Processing"
                                ? "warning.main"
                                : "text.secondary"
                            }
                          >
                            {order.status}
                          </Typography>
                        }
                      >
                        <ListItemText
                          primary={order.id}
                          secondary={`${order.customer} • ${order.amount}`}
                        />
                      </ListItem>
                      {index < recentOrders.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
