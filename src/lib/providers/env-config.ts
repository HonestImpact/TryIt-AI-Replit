// Environment-based LLM configuration resolver
// No hardcoded fallbacks - all configuration comes from environment variables

export type TaskType = 'default' | 'research' | 'deepbuild';

export interface LLMConfig {
  provider: string;
  model: string;
}

/**
 * Resolves LLM provider from environment variables
 * Throws descriptive error if not configured
 */
export function getProvider(taskType: TaskType = 'default'): string {
  const taskUpper = taskType.toUpperCase();
  const provider = 
    process.env[`LLM_${taskUpper}`] || 
    process.env.LLM_DEFAULT || 
    process.env.LLM;
  
  if (!provider) {
    throw new Error(
      `No LLM provider configured for task type '${taskType}'. ` +
      `Please set LLM_${taskUpper}, LLM_DEFAULT, or LLM in environment variables.`
    );
  }
  
  return provider;
}

/**
 * Resolves LLM model ID from environment variables
 * Throws descriptive error if not configured
 */
export function getModelId(taskType: TaskType = 'default'): string {
  const taskUpper = taskType.toUpperCase();
  const modelId = 
    process.env[`LLM_${taskUpper}_ID`] || 
    process.env.LLM_DEFAULT_ID || 
    process.env.MODEL_ID;
  
  if (!modelId) {
    throw new Error(
      `No model ID configured for task type '${taskType}'. ` +
      `Please set LLM_${taskUpper}_ID, LLM_DEFAULT_ID, or MODEL_ID in environment variables.`
    );
  }
  
  return modelId;
}

/**
 * Resolves complete LLM configuration for a task type
 * Throws descriptive error if not fully configured
 */
export function getLLMConfig(taskType: TaskType = 'default'): LLMConfig {
  return {
    provider: getProvider(taskType),
    model: getModelId(taskType)
  };
}
