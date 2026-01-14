'use client';

import { useState, useEffect } from 'react';
import { walletService, CreditCosts } from '@/services/wallet';
import { useAuth } from '@/context/AuthContext';

export function useCreditCheck() {
  const { user } = useAuth();
  const [creditCosts, setCreditCosts] = useState<CreditCosts | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCreditCosts();
  }, []);

  const loadCreditCosts = async () => {
    try {
      const costs = await walletService.getCreditCosts();
      setCreditCosts(costs);
    } catch (error) {
      console.error('Failed to load credit costs:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCredits = (
    toolType: keyof CreditCosts
  ): { 
    hasEnough: boolean; 
    required: number; 
    available: number 
  } => {
    if (!user || !creditCosts) {
      return { hasEnough: false, required: 0, available: 0 };
    }

    const required = creditCosts[toolType];
    const available = user.credits.totalCredits;
    const hasEnough = available >= required;

    return { hasEnough, required, available };
  };

  return {
    creditCosts,
    checkCredits,
    loading,
  };
}
