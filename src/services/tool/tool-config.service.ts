import { apiClient } from '../api/client';
import type { 
  ToolConfigFromDB, 
  ToolConfigCache 
} from '@/types/tool.types';

let configCache: ToolConfigCache | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch tool configs from public API
 */
export async function fetchToolConfigs(): Promise<ToolConfigCache> {
  try {
    const configs = await apiClient.get<ToolConfigFromDB[]>(
      '/api/ai/tools/config'
    );
    
    const cache: ToolConfigCache = {};
    configs.forEach((config) => {
      cache[config.tool_id as keyof ToolConfigCache] = config;
    });
    
    configCache = cache;
    lastFetchTime = Date.now();
    
    return cache;
  } catch (error: any) {
    // Log errors
    console.error('Failed to fetch tool configs:', {
      message: error?.message || error?.toString() || 'Unknown error',
      statusCode: error?.statusCode,
    });
    
    // Return empty cache on error
    return {};
  }
}

/**
 * Get cached tool configs or fetch if cache expired
 */
export async function getToolConfigs(): Promise<ToolConfigCache> {
  const now = Date.now();
  
  if (configCache && (now - lastFetchTime) < CACHE_DURATION) {
    return configCache;
  }
  
  return await fetchToolConfigs();
}

/**
 * Get specific tool config
 */
export async function getToolConfig(
  toolId: string
): Promise<ToolConfigFromDB | null> {
  const configs = await getToolConfigs();
  return configs[toolId as keyof ToolConfigCache] || null;
}

/**
 * Get max chars for a tool (with fallback to defaults)
 */
export async function getMaxChars(toolId: string): Promise<number> {
  const config = await getToolConfig(toolId);
  
  if (config && config.max_chars > 0) {
    return config.max_chars;
  }
  
  // Fallback to current hardcoded values
  const defaults: Record<string, number> = {
    summary: 4000,
    questions: 3000,
    explain: 2000,
    rewrite: 1200,
  };
  
  return defaults[toolId] || 2000;
}

/**
 * Get min chars for a tool
 */
export async function getMinChars(toolId: string): Promise<number> {
  const config = await getToolConfig(toolId);
  
  if (config && config.min_chars > 0) {
    return config.min_chars;
  }
  
  return 50; // Default minimum
}
