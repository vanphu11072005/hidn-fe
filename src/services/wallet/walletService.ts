import { apiClient } from '../api/client';
import type { WalletInfo, CreditCosts } from '@/types/wallet.types';

class WalletService {
  // Get current wallet info
  async getWallet(): Promise<WalletInfo> {
    return apiClient.get<WalletInfo>('/api/wallet');
  }

  // Get credit costs for all tools
  async getCreditCosts(): Promise<CreditCosts> {
    return apiClient.get<CreditCosts>('/api/wallet/costs');
  }

  // Check if user has enough credits for a tool
  hasEnoughCredits(
    totalCredits: number, 
    toolType: keyof CreditCosts, 
    costs: CreditCosts
  ): boolean {
    return totalCredits >= costs[toolType];
  }
}

export const walletService = new WalletService();
