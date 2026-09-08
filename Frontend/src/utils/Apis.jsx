const API_URL = import.meta.env.VITE_API_URL;

const Apis = {
  LOGIN: `${API_URL}/auth/login`,
  REGISTER: `${API_URL}/auth/register`,
  REFRESH_TOKEN: `${API_URL}/auth/refresh-token`,
  LOGOUT: `${API_URL}/auth/logout`,
  FORGET_PASSWORD: `${API_URL}/auth/forget-password`,
  RESET_PASSWORD: `${API_URL}/auth/reset-password`,

  TRANSACTIONS: `${API_URL}/transactions`,
  CATEGORIES: `${API_URL}/categories`,
  WALLETS: `${API_URL}/wallets`,
  BUDGETS: `${API_URL}/budgets`,
  BUDGET_SUGGESTION: "/budgets/suggestion",
  BUDGET_CURRENT_MONTH: "/budgets/current-month",
  BUDGET_BY_MONTH: "/budgets/by-month",
  BUDGET_BY_CATEGORY: "/budgets/by-category",
  PAYMENT_REMINDERS: `${API_URL}/payment-reminders`,
  SAVING_GOALS: `${API_URL}/saving-goals`,
  NOTIFICATIONS: `${API_URL}/notifications`,
  NOTIFICATIONS_READ_ALL: `${API_URL}/notifications/read-all`,
  PROFILE: `${API_URL}/users/me`,

  DEFAULT_CATEGORIES: `${API_URL}/default-categories`,
  ADMIN_DEFAULT_CATEGORIES: `${API_URL}/default-categories/admin`,

  COLORS: `${API_URL}/colors`,
  ADMIN_COLORS: `${API_URL}/colors/admin`,
  ADMIN_DASHBOARD: `${API_URL}/admin/dashboard`,

  CHANGE_USERNAME: "/users/change-username",
  CHANGE_PASSWORD: "/users/change-password",

  DASHBOARD: "/dashboard",
  DASHBOARD_EXPORT: "/dashboard/export",
  DASHBOARD_AI_ANALYSIS: "/dashboard/ai-analysis",
};

export default Apis;
