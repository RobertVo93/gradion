export type UserRole = "user" | "admin";

export type User = {
  id: number;
  email: string;
  role: UserRole;
  created_at: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
};

export type ReportStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";

export type Report = {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  status: ReportStatus;
  total_amount: string;
  created_at: string;
  updated_at: string;
};

export type ExpenseItem = {
  id: number;
  report_id: number;
  amount: string;
  currency: string;
  category: string;
  merchant_name: string | null;
  transaction_date: string;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ReceiptUploadResponse = {
  receipt_url: string;
  extraction_status: "completed" | "failed";
  extracted: {
    merchant_name: string | null;
    amount: string | number | null;
    currency: string | null;
    transaction_date: string | null;
  };
};
