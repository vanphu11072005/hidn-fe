/**
 * Tool Configuration Types
 * Types for tool configs fetched from database
 */

export interface ToolConfigFromDB {
  tool_id: string;
  tool_name: string;
  description: string;
  enabled: number;
  min_chars: number;
  max_chars: number;
  cooldown_seconds: number;
  cost_multiplier: number;
  model_provider: string;
  model_name: string;
}

export interface ToolConfigCache {
  summary?: ToolConfigFromDB;
  questions?: ToolConfigFromDB;
  explain?: ToolConfigFromDB;
  rewrite?: ToolConfigFromDB;
}
