 'use client';

import React, { useEffect, useState } from 'react';
import { Tooltip } from '@/components/common';
import { HelpCircle, ChevronDown, Zap } from 'lucide-react';
import { apiClient } from '@/services/api/client';

interface SummaryHeaderProps {
  config: any;
  collapsed: boolean;
  currentModeLabel: string;
  hasEnoughCredits: boolean;
}

export default function SummaryHeader({
  config,
  collapsed,
  currentModeLabel,
  hasEnoughCredits,
}: SummaryHeaderProps) {
  const [dynamicCost, setDynamicCost] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const costs = await apiClient.get<Record<string, number>>(
          '/api/wallet/costs'
        );
        const value = costs?.summary ?? null;
        if (mounted) setDynamicCost(value);
      } catch (e) {
        // ignore - fallback to config.creditCost
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const displayCost = dynamicCost ?? config.creditCost;
  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-[#212121]">
      <div
        className={`max-w-4xl mx-auto px-4 transition-all duration-200`}
      >
        <div className="mx-auto max-w-4xl w-full border-b border-b-[1px] border-gray-200 dark:border-gray-700 pb-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="text-3xl">
                {config.icon && (
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  <config.icon className="w-8 h-8 dark:text-white" />
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{config.name}</h1>
            </div>

            <div className="flex items-center">
              <Tooltip content={config.helpText} position="left">
                <HelpCircle
                  className="w-6 h-6 text-gray-700 cursor-help dark:text-white hover:text-primary transition-colors"
                  strokeWidth={1.6}
                />
              </Tooltip>
            </div>
          </div>

          {!collapsed && (
            <>
              <p className="text-gray-600 dark:text-gray-400">{config.description}</p>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Chế độ:</span>
                  <button
                    onClick={() => {
                      const plusBtn = document.querySelector(
                        'button[title="Thêm file"]'
                      ) as HTMLButtonElement | null;
                      if (plusBtn) {
                        plusBtn.click();
                      } else {
                        (document.querySelector('textarea') as HTMLTextAreaElement | null)?.focus();
                      }
                    }}
                    aria-haspopup="menu"
                    className="flex items-center gap-2 px-3 h-9 rounded-md border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                    title="Thay đổi chế độ tóm tắt"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-white">
                        {currentModeLabel}
                      </span>
                    <ChevronDown className="w-4 h-4 text-gray-400 dark:text-white transition-transform" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-sm text-primary">
                  <Zap className="w-5 h-5 text-amber-400 dark:text-white" />
                  <span>
                    <strong className="text-gray-900 dark:text-white">{displayCost} credit</strong>
                    <span className="text-gray-500 dark:text-gray-400"> / lần</span>
                  </span>
                  {!hasEnoughCredits && (
                    <span className="text-red-400 ml-2 font-medium">(Không đủ credits)</span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
