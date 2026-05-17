export type FundMember = {
  id: string;
  name: string;
  shirtNumber: number;
  amountDue: number;
  paidAmount: number;
  paidAt?: string;
};

export type FundTransaction = {
  id: string;
  date: string;
  title: string;
  category: "Sân" | "Nước" | "Quỹ" | "Khác";
  type: "income" | "expense";
  amount: number;
  note: string;
};

export type MonthlyCashflow = {
  month: string;
  income: number;
  expense: number;
};
