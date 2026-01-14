'use client';

import { useState, useEffect } from 'react';
import { 
  Save, 
  RotateCcw, 
  Coins,
  Wand2,
  Gift,
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
} from 'lucide-react';
import { adminService } from '@/services/admin';
import type { CreditConfig, ToolPricing, BonusConfig } from '@/types/admin.types';

export default function AdminCreditConfigPage() {
  const [config, setConfig] = useState<CreditConfig | null>(null);
  const [originalConfig, setOriginalConfig] = useState<CreditConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Fetch credit config from API
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await adminService.getCreditConfig();
        setConfig(data);
        setOriginalConfig(data);
      } catch (err) {
        console.error('Failed to fetch credit config:', err);
        setError('Không thể tải cấu hình credit');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  // Update tool pricing
  const updateToolCost = (toolId: string, newCost: number) => {
    setConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        toolPricing: prev.toolPricing.map((tool) =>
          tool.toolId === toolId
            ? { ...tool, creditCost: Math.max(0, newCost) }
            : tool
        ),
      };
    });
    setHasChanges(true);
  };

  // Update daily free credits
  const updateDailyCredits = (amount: number) => {
    setConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        dailyFreeCredits: Math.max(0, amount),
      };
    });
    setHasChanges(true);
  };

  // Update bonus config
  const updateBonusConfig = (
    field: keyof CreditConfig['bonusConfig'],
    value: any
  ) => {
    setConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        bonusConfig: {
          ...prev.bonusConfig,
          [field]: value,
        },
      };
    });
    setHasChanges(true);
  };

  // Reset to original
  const handleReset = () => {
    if (originalConfig) {
      setConfig(originalConfig);
      setHasChanges(false);
      setActionMessage({
        type: 'success',
        text: 'Đã reset về cấu hình ban đầu',
      });
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  // Save configuration
  const handleSave = async () => {
    if (!config) return;

    try {
      setIsSaving(true);
      await adminService.updateCreditConfig(config);
      
      setOriginalConfig(config);
      setActionMessage({
        type: 'success',
        text: 'Cấu hình credit đã được lưu thành công',
      });
      setShowSaveModal(false);
      setHasChanges(false);
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save credit config:', err);
      setActionMessage({
        type: 'error',
        text: 'Không thể lưu cấu hình. Vui lòng thử lại.',
      });
      setTimeout(() => setActionMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate impact summary
  const getImpactSummary = () => {
    if (!config || !originalConfig) return [];

    const changes: string[] = [];

    // Check tool pricing changes
    config.toolPricing.forEach((tool) => {
      const original = originalConfig.toolPricing.find(
        (t) => t.toolId === tool.toolId
      );
      if (original && original.creditCost !== tool.creditCost) {
        const diff = tool.creditCost - original.creditCost;
        changes.push(
          `${tool.toolName}: ${original.creditCost} → ${tool.creditCost} credits ` +
          `(${diff > 0 ? '+' : ''}${diff})`
        );
      }
    });

    // Check daily credits change
    if (config.dailyFreeCredits !== originalConfig.dailyFreeCredits) {
      const diff = config.dailyFreeCredits - originalConfig.dailyFreeCredits;
      changes.push(
        `Credits miễn phí hàng ngày: ${originalConfig.dailyFreeCredits} → ` +
        `${config.dailyFreeCredits} (${diff > 0 ? '+' : ''}${diff})`
      );
    }

    // Check bonus config
    if (config.bonusConfig.enabled !== originalConfig.bonusConfig.enabled) {
      changes.push(
        `Bonus event: ${config.bonusConfig.enabled ? 'Bật' : 'Tắt'}`
      );
    }

    return changes;
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isLoading ? (
        <div 
          className="
            flex items-center justify-center 
            min-h-[400px]
          "
        >
          <div className="text-center">
            <Loader2 
              className="
                w-8 h-8 animate-spin text-blue-500 
                mx-auto mb-3
              " 
            />
            <p className="text-sm text-slate-400">
              Đang tải cấu hình...
            </p>
          </div>
        </div>
      ) : error ? (
        <div 
          className="
            p-6 rounded-lg border bg-red-500/10 
            border-red-500/50 text-center
          "
        >
          <AlertCircle 
            className="w-8 h-8 text-red-400 mx-auto mb-3" 
          />
          <p className="text-sm text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="
              px-4 py-2 bg-red-600 text-white 
              rounded-lg hover:bg-red-700 
              transition-colors text-sm
            "
          >
            Thử lại
          </button>
        </div>
      ) : !config ? (
        <div className="text-center text-slate-400 py-12">
          Không có dữ liệu cấu hình
        </div>
      ) : (
        <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Credit Configuration
          </h1>
          <p className="text-sm text-slate-400">
            Cấu hình luật credit cho toàn hệ thống
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="
                flex items-center gap-2 px-4 py-2 
                bg-slate-800 text-slate-300 rounded-lg 
                hover:bg-slate-700 transition-colors
              "
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm">Reset</span>
            </button>
          )}
          <button
            onClick={() => setShowSaveModal(true)}
            disabled={!hasChanges || isSaving}
            className="
              flex items-center gap-2 px-4 py-2 
              bg-blue-600 text-white rounded-lg 
              hover:bg-blue-700 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span className="text-sm">Lưu thay đổi</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action Feedback */}
      {actionMessage && (
        <div
          className={`
            p-4 rounded-lg border flex items-center gap-3
            ${
              actionMessage.type === 'success'
                ? 'bg-green-500/10 border-green-500/50 text-green-400'
                : 'bg-red-500/10 border-red-500/50 text-red-400'
            }
          `}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="text-sm font-medium flex-1">
            {actionMessage.text}
          </p>
          <button
            onClick={() => setActionMessage(null)}
            className="hover:opacity-70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Daily Free Credits */}
      <div 
        className="
          bg-slate-900 border border-slate-800 
          rounded-lg p-6
        "
      >
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="
              w-10 h-10 bg-yellow-500/10 rounded-lg 
              flex items-center justify-center
            "
          >
            <Coins className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Credits Miễn Phí Hàng Ngày
            </h2>
            <p className="text-xs text-slate-400">
              Số credits user nhận miễn phí mỗi ngày (reset 00:00)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="number"
            value={config.dailyFreeCredits}
            onChange={(e) => 
              updateDailyCredits(parseInt(e.target.value) || 0)
            }
            min="0"
            className="
              w-32 px-4 py-3 bg-slate-800 
              border border-slate-700 rounded-lg 
              text-white text-center text-2xl font-bold
              focus:outline-none focus:ring-2 
              focus:ring-blue-500 focus:border-transparent
            "
          />
          <div className="flex-1">
            <p className="text-sm text-slate-300 mb-1">
              Mỗi user sẽ nhận <span className="font-bold text-yellow-400">
                {config.dailyFreeCredits} credits
              </span> vào 00:00 hàng ngày
            </p>
            <p className="text-xs text-slate-500">
              Với {config.dailyFreeCredits} credits, user có thể dùng:
              {' '}
              {config.toolPricing.map((tool, index) => (
                <span key={tool.toolId}>
                  {tool.toolName} ~{Math.floor(
                    config.dailyFreeCredits / tool.creditCost
                  )} lần
                  {index < config.toolPricing.length - 1 && ', '}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>

      {/* Tool Pricing Configuration */}
      <div 
        className="
          bg-slate-900 border border-slate-800 
          rounded-lg p-6
        "
      >
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="
              w-10 h-10 bg-purple-500/10 rounded-lg 
              flex items-center justify-center
            "
          >
            <Wand2 className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Chi Phí AI Tools
            </h2>
            <p className="text-xs text-slate-400">
              Cấu hình số credits cần thiết cho mỗi tool
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config.toolPricing.map((tool) => (
            <div
              key={tool.toolId}
              className="
                p-4 bg-slate-800/50 border border-slate-700 
                rounded-lg
              "
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white mb-1">
                    {tool.toolName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3">
                <input
                  type="number"
                  value={tool.creditCost}
                  onChange={(e) =>
                    updateToolCost(
                      tool.toolId,
                      parseInt(e.target.value) || 0
                    )
                  }
                  min="0"
                  className="
                    w-20 px-3 py-2 bg-slate-900 
                    border border-slate-600 rounded-lg 
                    text-white text-center font-bold
                    focus:outline-none focus:ring-2 
                    focus:ring-purple-500 focus:border-transparent
                  "
                />
                <span className="text-sm text-slate-400">
                  credits / lần sử dụng
                </span>
              </div>

              {/* Cost change indicator */}
              {(() => {
                if (!originalConfig) return null;
                const original = originalConfig.toolPricing.find(
                  (t) => t.toolId === tool.toolId
                );
                if (original && original.creditCost !== tool.creditCost) {
                  const diff = tool.creditCost - original.creditCost;
                  return (
                    <div 
                      className="
                        mt-2 text-xs font-medium
                      "
                    >
                      <span 
                        className={
                          diff > 0 ? 'text-red-400' : 'text-green-400'
                        }
                      >
                        {diff > 0 ? '↑' : '↓'} {Math.abs(diff)} credits
                        {' '}({original.creditCost} → {tool.creditCost})
                      </span>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          ))}
        </div>
      </div>

      {/* Bonus Event Configuration */}
      <div 
        className="
          bg-slate-900 border border-slate-800 
          rounded-lg p-6
        "
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="
                w-10 h-10 bg-pink-500/10 rounded-lg 
                flex items-center justify-center
              "
            >
              <Gift className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Bonus Event Credits
              </h2>
              <p className="text-xs text-slate-400">
                Tặng thêm credits cho tất cả users trong event đặc biệt
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.bonusConfig.enabled}
              onChange={(e) =>
                updateBonusConfig('enabled', e.target.checked)
              }
              className="
                w-5 h-5 rounded bg-slate-800 
                border-slate-600 text-blue-600 
                focus:ring-2 focus:ring-blue-500
              "
            />
            <span className="text-sm text-slate-300">
              {config.bonusConfig.enabled ? 'Đang bật' : 'Đã tắt'}
            </span>
          </label>
        </div>

        {config.bonusConfig.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-2">
                Số credits tặng
              </label>
              <input
                type="number"
                value={config.bonusConfig.amount}
                onChange={(e) =>
                  updateBonusConfig(
                    'amount',
                    parseInt(e.target.value) || 0
                  )
                }
                min="0"
                placeholder="VD: 50"
                className="
                  w-full px-3 py-2 bg-slate-800 
                  border border-slate-700 rounded-lg 
                  text-white
                  focus:outline-none focus:ring-2 
                  focus:ring-pink-500 focus:border-transparent
                "
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2">
                Lý do / Tên event
              </label>
              <input
                type="text"
                value={config.bonusConfig.reason}
                onChange={(e) =>
                  updateBonusConfig('reason', e.target.value)
                }
                placeholder="VD: Tết 2026"
                className="
                  w-full px-3 py-2 bg-slate-800 
                  border border-slate-700 rounded-lg 
                  text-white placeholder-slate-500
                  focus:outline-none focus:ring-2 
                  focus:ring-pink-500 focus:border-transparent
                "
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2">
                Hiệu lực đến
              </label>
              <input
                type="date"
                value={config.bonusConfig.validUntil}
                onChange={(e) =>
                  updateBonusConfig('validUntil', e.target.value)
                }
                className="
                  w-full px-3 py-2 bg-slate-800 
                  border border-slate-700 rounded-lg 
                  text-white
                  focus:outline-none focus:ring-2 
                  focus:ring-pink-500 focus:border-transparent
                "
              />
            </div>
          </div>
        )}

        {config.bonusConfig.enabled && (
          <div 
            className="
              mt-4 p-3 bg-pink-500/10 border 
              border-pink-500/30 rounded-lg
            "
          >
            <p className="text-sm text-pink-300">
              💝 Khi bật, mỗi user sẽ nhận thêm{' '}
              <span className="font-bold">
                {config.bonusConfig.amount} credits
              </span>
              {config.bonusConfig.reason && (
                <> cho sự kiện "{config.bonusConfig.reason}"</>
              )}
              {config.bonusConfig.validUntil && (
                <> (đến {new Date(
                  config.bonusConfig.validUntil
                ).toLocaleDateString('vi-VN')})</>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Save Confirmation Modal */}
      {showSaveModal && (
        <div
          className="
            fixed inset-0 bg-black/60 backdrop-blur-sm 
            flex items-center justify-center z-50 p-4
          "
          onClick={() => setShowSaveModal(false)}
        >
          <div
            className="
              bg-slate-900 border border-slate-800 
              rounded-lg p-6 max-w-lg w-full
            "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-semibold text-white">
                Xác nhận lưu cấu hình
              </h3>
            </div>

            <p className="text-sm text-slate-300 mb-4">
              Thay đổi sẽ được áp dụng <span className="font-bold text-white">
                ngay lập tức
              </span> cho toàn bộ hệ thống.
            </p>

            {/* Impact Summary */}
            {getImpactSummary().length > 0 && (
              <div 
                className="
                  mb-4 p-4 bg-slate-800 rounded-lg 
                  border border-slate-700
                "
              >
                <p className="text-xs text-slate-400 mb-2 font-semibold">
                  Tổng quan thay đổi:
                </p>
                <ul className="space-y-1">
                  {getImpactSummary().map((change, index) => (
                    <li 
                      key={index} 
                      className="text-sm text-slate-300 flex items-start gap-2"
                    >
                      <span className="text-blue-400">•</span>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div 
              className="
                p-3 bg-yellow-500/10 border 
                border-yellow-500/30 rounded-lg mb-4
              "
            >
              <p className="text-xs text-yellow-400">
                ⚠️ Lưu ý: User đang hoạt động sẽ thấy thay đổi ngay lập tức. 
                Không thể hoàn tác sau khi lưu.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="
                  flex-1 px-4 py-2 bg-slate-800 
                  text-white rounded-lg hover:bg-slate-700 
                  transition-colors text-sm font-medium
                "
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="
                  flex-1 px-4 py-2 bg-blue-600 
                  text-white rounded-lg hover:bg-blue-700 
                  transition-colors text-sm font-medium
                "
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
