'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  RotateCcw,
  AlertCircle,
  Zap,
  Clock,
  FileText,
  TrendingUp,
  Power,
  Settings2,
  Loader2,
} from 'lucide-react';
import { adminService } from '@/services/admin';
import type { AdminToolConfig } from '@/types/admin.types';

// Types
interface ToolConfig {
  toolId: string;
  toolName: string;
  description: string;
  enabled: boolean;
  inputLimits: {
    minChars: number;
    maxChars: number;
  };
  cooldownSeconds: number;
  costMultiplier: number;
  model: {
    provider: string;
    modelName: string;
  };
}

// Convert DB format to UI format
const convertDbToUi = (dbConfig: AdminToolConfig): ToolConfig => ({
  toolId: dbConfig.tool_id,
  toolName: dbConfig.tool_name,
  description: dbConfig.description,
  enabled: dbConfig.enabled === 1,
  inputLimits: {
    minChars: dbConfig.min_chars,
    maxChars: dbConfig.max_chars,
  },
  cooldownSeconds: dbConfig.cooldown_seconds,
  costMultiplier: dbConfig.cost_multiplier,
  model: {
    provider: dbConfig.model_provider,
    modelName: dbConfig.model_name,
  },
});

// Convert UI format to DB format
const convertUiToDb = (uiConfig: ToolConfig): AdminToolConfig => ({
  tool_id: uiConfig.toolId,
  tool_name: uiConfig.toolName,
  description: uiConfig.description,
  enabled: uiConfig.enabled ? 1 : 0,
  min_chars: uiConfig.inputLimits.minChars,
  max_chars: uiConfig.inputLimits.maxChars,
  cooldown_seconds: uiConfig.cooldownSeconds,
  cost_multiplier: uiConfig.costMultiplier,
  model_provider: uiConfig.model.provider,
  model_name: uiConfig.model.modelName,
});

export default function AdminToolConfigPage() {
  const [configs, setConfigs] = useState<ToolConfig[]>([]);
  const [initialConfigs, setInitialConfigs] = useState<ToolConfig[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch configs from API
  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        setLoading(true);
        setError(null);

        const dbConfigs = await adminService.getToolConfigs();
        const uiConfigs = dbConfigs.map(convertDbToUi);

        setConfigs(uiConfigs);
        setInitialConfigs(uiConfigs);
      } catch (err) {
        console.error('Failed to fetch tool configs:', err);
        setError('Không thể tải cấu hình tools');
      } finally {
        setLoading(false);
      }
    };

    fetchConfigs();
  }, []);

  // Track changes
  const hasChanges = JSON.stringify(configs) !== JSON.stringify(initialConfigs);

  // Get changes for confirmation modal
  const getChanges = () => {
    const changes: Array<{
      tool: string;
      field: string;
      oldValue: any;
      newValue: any;
    }> = [];

    configs.forEach((config, index) => {
      const initial = initialConfigs[index];
      
      if (config.enabled !== initial.enabled) {
        changes.push({
          tool: config.toolName,
          field: 'Trạng thái',
          oldValue: initial.enabled ? 'Bật' : 'Tắt',
          newValue: config.enabled ? 'Bật' : 'Tắt',
        });
      }

      if (config.inputLimits.minChars !== initial.inputLimits.minChars) {
        changes.push({
          tool: config.toolName,
          field: 'Min chars',
          oldValue: initial.inputLimits.minChars,
          newValue: config.inputLimits.minChars,
        });
      }

      if (config.inputLimits.maxChars !== initial.inputLimits.maxChars) {
        changes.push({
          tool: config.toolName,
          field: 'Max chars',
          oldValue: initial.inputLimits.maxChars,
          newValue: config.inputLimits.maxChars,
        });
      }

      if (config.cooldownSeconds !== initial.cooldownSeconds) {
        changes.push({
          tool: config.toolName,
          field: 'Cooldown',
          oldValue: `${initial.cooldownSeconds}s`,
          newValue: `${config.cooldownSeconds}s`,
        });
      }

      if (config.costMultiplier !== initial.costMultiplier) {
        changes.push({
          tool: config.toolName,
          field: 'Cost multiplier',
          oldValue: `${initial.costMultiplier}x`,
          newValue: `${config.costMultiplier}x`,
        });
      }
    });

    return changes;
  };

  const handleToggleEnabled = (toolId: string) => {
    setConfigs((prev) =>
      prev.map((config) =>
        config.toolId === toolId
          ? { ...config, enabled: !config.enabled }
          : config
      )
    );
  };

  const handleUpdateConfig = (
    toolId: string,
    field: keyof ToolConfig,
    value: any
  ) => {
    setConfigs((prev) =>
      prev.map((config) =>
        config.toolId === toolId ? { ...config, [field]: value } : config
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const dbConfigs = configs.map(convertUiToDb);
      await adminService.updateToolConfigs(dbConfigs);

      // Update initial configs to current state
      setInitialConfigs(configs);
      setShowSaveModal(false);

      // Show success message
      alert('Cấu hình đã được lưu thành công!');
    } catch (err) {
      console.error('Failed to save tool configs:', err);
      alert('Lỗi: Không thể lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (
      confirm(
        'Bạn có chắc muốn hủy bỏ tất cả thay đổi chưa lưu?'
      )
    ) {
      setConfigs([...initialConfigs]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading ? (
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
      ) : (
        <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Tool Configuration
          </h1>
          <p className="text-sm text-slate-400">
            Quản lý cấu hình chi tiết cho từng AI tool
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="
              px-4 py-2 rounded-lg border border-slate-700
              text-sm font-medium text-slate-300
              hover:bg-slate-800 hover:text-white
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all flex items-center gap-2
            "
          >
            <RotateCcw className="w-4 h-4" />
            Hủy
          </button>

          <button
            onClick={() => setShowSaveModal(true)}
            disabled={!hasChanges}
            className="
              px-4 py-2 rounded-lg bg-blue-600
              text-sm font-medium text-white
              hover:bg-blue-700
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all flex items-center gap-2
            "
          >
            <Save className="w-4 h-4" />
            Lưu Thay Đổi
            {hasChanges && (
              <span 
                className="
                  ml-1 px-2 py-0.5 rounded-full 
                  bg-white/20 text-xs
                "
              >
                {getChanges().length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Warning Banner */}
      {hasChanges && (
        <div 
          className="
            bg-yellow-500/10 border border-yellow-500/30 
            rounded-lg p-4 flex items-start gap-3
          "
        >
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-200">
              Bạn có {getChanges().length} thay đổi chưa lưu
            </p>
            <p className="text-xs text-yellow-300/70 mt-1">
              Nhớ click "Lưu Thay Đổi" để áp dụng cấu hình mới 
              cho toàn hệ thống.
            </p>
          </div>
        </div>
      )}

      {/* Tool Configs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {configs.map((config) => {
          const initial = initialConfigs.find(
            (c) => c.toolId === config.toolId
          );
          const hasToolChanges = initial && 
            JSON.stringify(config) !== JSON.stringify(initial);

          return (
            <div
              key={config.toolId}
              className={`
                bg-slate-900 border rounded-lg overflow-hidden
                transition-all
                ${
                  hasToolChanges
                    ? 'border-blue-500/50 shadow-lg shadow-blue-500/10'
                    : 'border-slate-800'
                }
              `}
            >
              {/* Header */}
              <div 
                className="
                  p-4 border-b border-slate-800 
                  flex items-center justify-between
                "
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white">
                      {config.toolName}
                    </h3>
                    {hasToolChanges && (
                      <span 
                        className="
                          px-2 py-0.5 rounded-full 
                          bg-blue-500/20 text-blue-400 
                          text-xs font-medium
                        "
                      >
                        Đã sửa
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {config.description}
                  </p>
                </div>

                {/* Enable/Disable Toggle */}
                <button
                  onClick={() => handleToggleEnabled(config.toolId)}
                  className={`
                    relative w-12 h-6 rounded-full 
                    transition-all flex-shrink-0
                    ${
                      config.enabled
                        ? 'bg-green-500'
                        : 'bg-slate-700'
                    }
                  `}
                >
                  <div
                    className={`
                      absolute top-1 left-1 w-4 h-4 
                      bg-white rounded-full transition-transform
                      ${config.enabled ? 'translate-x-6' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>

              {/* Config Fields */}
              <div className="p-4 space-y-4">
                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    <Power className="w-3 h-3 inline mr-1" />
                    Trạng thái
                  </label>
                  <div 
                    className={`
                      inline-flex px-3 py-1.5 rounded-lg text-sm 
                      font-medium
                      ${
                        config.enabled
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-slate-700 text-slate-400'
                      }
                    `}
                  >
                    {config.enabled ? 'Đang hoạt động' : 'Đã tắt'}
                  </div>
                </div>

                {/* Input Limits */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    <FileText className="w-3 h-3 inline mr-1" />
                    Giới hạn đầu vào (ký tự)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">
                        Tối thiểu
                      </label>
                      <input
                        type="number"
                        value={config.inputLimits.minChars}
                        onChange={(e) =>
                          handleUpdateConfig(config.toolId, 'inputLimits', {
                            ...config.inputLimits,
                            minChars: parseInt(e.target.value) || 0,
                          })
                        }
                        className="
                          w-full px-3 py-2 rounded-lg
                          bg-slate-800 border border-slate-700
                          text-white text-sm
                          focus:border-blue-500 focus:outline-none
                        "
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">
                        Tối đa
                      </label>
                      <input
                        type="number"
                        value={config.inputLimits.maxChars}
                        onChange={(e) =>
                          handleUpdateConfig(config.toolId, 'inputLimits', {
                            ...config.inputLimits,
                            maxChars: parseInt(e.target.value) || 0,
                          })
                        }
                        className="
                          w-full px-3 py-2 rounded-lg
                          bg-slate-800 border border-slate-700
                          text-white text-sm
                          focus:border-blue-500 focus:outline-none
                        "
                      />
                    </div>
                  </div>
                </div>

                {/* Cooldown */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Cooldown (giây)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="1"
                      value={config.cooldownSeconds}
                      onChange={(e) =>
                        handleUpdateConfig(
                          config.toolId,
                          'cooldownSeconds',
                          parseInt(e.target.value)
                        )
                      }
                      className="flex-1"
                    />
                    <input
                      type="number"
                      value={config.cooldownSeconds}
                      onChange={(e) =>
                        handleUpdateConfig(
                          config.toolId,
                          'cooldownSeconds',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="
                        w-16 px-2 py-1.5 rounded-lg
                        bg-slate-800 border border-slate-700
                        text-white text-sm text-center
                        focus:border-blue-500 focus:outline-none
                      "
                    />
                    <span className="text-sm text-slate-500">s</span>
                  </div>
                </div>

                {/* Cost Multiplier */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    Hệ số chi phí
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.5"
                      max="5"
                      step="0.1"
                      value={config.costMultiplier}
                      onChange={(e) =>
                        handleUpdateConfig(
                          config.toolId,
                          'costMultiplier',
                          parseFloat(e.target.value)
                        )
                      }
                      className="flex-1"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={config.costMultiplier}
                      onChange={(e) =>
                        handleUpdateConfig(
                          config.toolId,
                          'costMultiplier',
                          parseFloat(e.target.value) || 1.0
                        )
                      }
                      className="
                        w-16 px-2 py-1.5 rounded-lg
                        bg-slate-800 border border-slate-700
                        text-white text-sm text-center
                        focus:border-blue-500 focus:outline-none
                      "
                    />
                    <span className="text-sm text-slate-500">x</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Chi phí thực tế = Credit cơ bản × {config.costMultiplier}
                  </p>
                </div>

                {/* Model Info */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    <Settings2 className="w-3 h-3 inline mr-1" />
                    AI Model
                  </label>
                  <div 
                    className="
                      px-3 py-2 rounded-lg bg-slate-800 
                      border border-slate-700
                    "
                  >
                    <p className="text-sm text-white">
                      {config.model.modelName}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Provider: {config.model.provider}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Confirmation Modal */}
      {showSaveModal && (
        <div 
          className="
            fixed inset-0 bg-black/50 backdrop-blur-sm 
            z-50 flex items-center justify-center p-4
          "
        >
          <div 
            className="
              bg-slate-900 border border-slate-800 
              rounded-lg max-w-2xl w-full max-h-[80vh] 
              overflow-auto
            "
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white mb-1">
                Xác nhận lưu cấu hình
              </h2>
              <p className="text-sm text-slate-400">
                Các thay đổi sẽ được áp dụng ngay lập tức cho toàn hệ thống
              </p>
            </div>

            {/* Changes List */}
            <div className="p-6">
              <div className="space-y-3">
                {getChanges().map((change, index) => (
                  <div
                    key={index}
                    className="
                      flex items-center justify-between 
                      p-3 rounded-lg bg-slate-800/50
                    "
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {change.tool}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {change.field}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500 line-through">
                        {change.oldValue}
                      </p>
                      <p className="text-sm font-medium text-blue-400">
                        → {change.newValue}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Warning */}
              <div 
                className="
                  mt-6 p-4 rounded-lg 
                  bg-yellow-500/10 border border-yellow-500/30
                  flex items-start gap-3
                "
              >
                <AlertCircle 
                  className="
                    w-5 h-5 text-yellow-500 
                    flex-shrink-0 mt-0.5
                  " 
                />
                <div>
                  <p className="text-sm font-medium text-yellow-200">
                    Lưu ý quan trọng
                  </p>
                  <ul 
                    className="
                      text-xs text-yellow-300/70 
                      mt-2 space-y-1 list-disc list-inside
                    "
                  >
                    <li>
                      Thay đổi sẽ ảnh hưởng đến tất cả người dùng ngay lập tức
                    </li>
                    <li>
                      Tool bị tắt sẽ không thể sử dụng cho đến khi bật lại
                    </li>
                    <li>
                      Cost multiplier ảnh hưởng trực tiếp đến credit tiêu thụ
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div 
              className="
                p-6 border-t border-slate-800 
                flex items-center justify-end gap-3
              "
            >
              <button
                onClick={() => setShowSaveModal(false)}
                disabled={saving}
                className="
                  px-4 py-2 rounded-lg border border-slate-700
                  text-sm font-medium text-slate-300
                  hover:bg-slate-800 hover:text-white
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all
                "
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="
                  px-6 py-2 rounded-lg bg-blue-600
                  text-sm font-medium text-white
                  hover:bg-blue-700
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all flex items-center gap-2
                "
              >
                {saving ? (
                  <>
                    <div 
                      className="
                        w-4 h-4 border-2 border-white/30 
                        border-t-white rounded-full animate-spin
                      " 
                    />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Xác nhận lưu
                  </>
                )}
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
