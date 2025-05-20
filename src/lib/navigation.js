import {
  Users,
  Settings,
  Database,
  BarChart,
  FolderPlus,
  User,
  Upload,
  FileText,
  DollarSign,
  Home,
  ShoppingCart,
  CreditCard,
  HelpCircle,
  Bell,
} from "lucide-react";

// Admin navigation items
export const adminNavItems = [
  {
    label: "Dashboard",
    href: "/admin-dashboard",
    icon: <BarChart className="h-5 w-5" />,
  },
  {
    label: "Products",
    href: "/admin-dashboard/products",
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: "Invoices",
    href: "/admin-dashboard/invoices",
    icon: <FolderPlus className="h-5 w-5" />,
  },
  {
    label: "Coupons",
    href: "/admin-dashboard/coupons",
    icon: <Database className="h-5 w-5" />,
  },
  {
    label: "Tickets",
    href: "/admin-dashboard/tickets",
    icon: <Upload className="h-5 w-5" />,
  },
  {
    label: "Inventory",
    href: "/admin-dashboard/inventory",
    icon: <DollarSign className="h-5 w-5" />,
  },
  {
    label: "Reports",
    href: "/admin-dashboard/reports",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: "Users",
    href: "/admin-dashboard/users",
    icon: <User className="h-5 w-5" />,
  },
  {
    label: "Reviews",
    href: "/admin-dashboard/reviews",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: "Settings",
    href: "/admin-dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

// Customer navigation items
export const customerNavItems = [
  {
    label: "Home",
    href: "/customer",
    icon: <Home className="h-5 w-5" />,
  },
  {
    label: "Shop",
    href: "/customer/shop",
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    label: "Orders",
    href: "/customer/orders",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    label: "Support",
    href: "/customer/support",
    icon: <HelpCircle className="h-5 w-5" />,
  },
  {
    label: "Notifications",
    href: "/customer/notifications",
    icon: <Bell className="h-5 w-5" />,
  },
  {
    label: "Settings",
    href: "/customer/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

// Staff navigation items
export const staffNavItems = [
  {
    label: "Dashboard",
    href: "/staff",
    icon: <BarChart className="h-5 w-5" />,
  },
  {
    label: "Orders",
    href: "/staff/orders",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    label: "Inventory",
    href: "/staff/inventory",
    icon: <DollarSign className="h-5 w-5" />,
  },
  {
    label: "Customers",
    href: "/staff/customers",
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: "Support Tickets",
    href: "/staff/tickets",
    icon: <HelpCircle className="h-5 w-5" />,
  },
];

// Get navigation items based on user role
export const getNavItemsByRole = (role) => {
  switch (role) {
    case "admin":
      return adminNavItems;
    case "customer":
      return customerNavItems;
    case "staff":
      return staffNavItems;
    default:
      return [];
  }
};
