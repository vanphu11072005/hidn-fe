// Wallet related TypeScript types
export interface WalletInfo {
  userId: number;
  freeCredits: number;
  paidCredits: number;
  totalCredits: number;
  usedToday: number;
}

export interface CreditCosts {
  summary: number;
  questions: number;
  explain: number;
  rewrite: number;
}
