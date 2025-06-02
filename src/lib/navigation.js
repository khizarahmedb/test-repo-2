import {
  Users,
  Settings,
  BarChart,
  FileText,
  Home,
  ShoppingCart,
  CreditCard,
  HelpCircle,
  Bell,
  ShoppingBag,
  Tag,
  MessageSquare,
  Package,
  Star,
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
    icon: <ShoppingBag className="h-5 w-5" />,
  },
  {
    label: "Categories",
    href: "/admin-dashboard/categories",
    icon: <ShoppingBag className="h-5 w-5" />,
  },
  {
    label: "Invoices",
    href: "/admin-dashboard/invoices",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: "Coupons",
    href: "/admin-dashboard/coupons",
    icon: <Tag className="h-5 w-5" />,
  },
  {
    label: "Tickets",
    href: "/admin-dashboard/tickets",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    label: "Inventory",
    href: "/admin-dashboard/inventory",
    icon: <Package className="h-5 w-5" />,
  },
  {
    label: "Users",
    href: "/admin-dashboard/users",
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: "Reviews",
    href: "/admin-dashboard/reviews",
    icon: <Star className="h-5 w-5" />,
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
    href: "/customer-dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    label: "Products",
    href: "/customer-dashboard/products",
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    label: "Wallet",
    href: "/customer-dashboard/wallet",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    label: "Tickets",
    href: "/customer-dashboard/tickets",
    icon: <HelpCircle className="h-5 w-5" />,
  },
  {
    label: "Referrals",
    href: "/customer-dashboard/referrals",
    icon: <Bell className="h-5 w-5" />,
  },
  {
    label: "Settings",
    href: "/customer-dashboard/settings",
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
    icon: <Package className="h-5 w-5" />,
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
