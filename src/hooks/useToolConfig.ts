import { useEffect, useState } from 'react';
import { getToolConfig } from '@/services/tool/tool-config.service';
import { TOOL_CONFIGS, ToolConfig, ToolType } from '@/types/ai.types';

/**
 * Hook to load tool config from database with fallback to defaults
 */
export function useToolConfig(toolType: ToolType) {
  const defaultConfig = TOOL_CONFIGS[toolType];
  const [config, setConfig] = useState<ToolConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadConfig() {
      try {
        const dbConfig = await getToolConfig(toolType);
        
        if (mounted && dbConfig) {
          // Merge DB config with default config
          setConfig({
            ...defaultConfig,
            maxLength: dbConfig.max_chars || defaultConfig.maxLength,
            minLength: dbConfig.min_chars || defaultConfig.minLength || 50,
            // creditCost is handled separately by wallet/costs API
          });
        }
      } catch (error) {
        console.error('Failed to load tool config:', error);
        // Keep using default config
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadConfig();

    return () => {
      mounted = false;
    };
  }, [toolType]);

  return { config, loading };
}
