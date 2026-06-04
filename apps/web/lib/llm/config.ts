/**
 * LLM Configuration for Pebble
 * 默认使用 NVIDIA OpenAI-compatible endpoint 作为LLM提供商
 */

export type LLMProvider = 'nvidia' | 'zhipu' | 'openai' | 'anthropic';

export interface LLMConfig {
  provider: LLMProvider;
  name: string;
  description: string;
  model: string;
  enabled: boolean;
}

/**
 * 可用的LLM提供商配置
 */
export const LLM_PROVIDERS: Record<LLMProvider, LLMConfig> = {
  nvidia: {
    provider: 'nvidia',
    name: 'NVIDIA API Catalog',
    description: 'OpenAI-compatible endpoint，可运行 GLM 等模型',
    model: process.env.NVIDIA_MODEL || 'qwen/qwen3-next-80b-a3b-instruct',
    enabled: true,
  },
  zhipu: {
    provider: 'zhipu',
    name: '智谱AI',
    description: '国产大模型，对中国文化理解更深入',
    model: 'glm-4-flash-250414',
    enabled: true,
  },
  openai: {
    provider: 'openai',
    name: 'OpenAI',
    description: 'GPT-4系列模型',
    model: 'gpt-4o-mini',
    enabled: false,
  },
  anthropic: {
    provider: 'anthropic',
    name: 'Anthropic',
    description: 'Claude系列模型',
    model: 'claude-3-haiku-20240307',
    enabled: false,
  },
};

/**
 * 获取默认LLM提供商
 * 优先从环境变量读取，默认为 nvidia
 */
export function getDefaultProvider(): LLMProvider {
  const envProvider = process.env.DEFAULT_LLM_PROVIDER as LLMProvider;
  if (envProvider && LLM_PROVIDERS[envProvider]) {
    return envProvider;
  }
  return 'nvidia';
}

/**
 * 获取指定提供商的API Key
 */
export function getApiKey(provider: LLMProvider): string | undefined {
  const keyMap: Record<LLMProvider, string | undefined> = {
    nvidia: process.env.NVIDIA_API_KEY,
    zhipu: process.env.ZHIPU_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
  };
  return keyMap[provider];
}

export function getProviderBaseUrl(provider: LLMProvider): string | undefined {
  const baseUrlMap: Record<LLMProvider, string | undefined> = {
    nvidia: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
    zhipu: undefined,
    openai: undefined,
    anthropic: undefined,
  };
  return baseUrlMap[provider];
}

export function getProviderModel(provider: LLMProvider): string {
  if (provider === 'nvidia') {
    return process.env.NVIDIA_MODEL || LLM_PROVIDERS.nvidia.model;
  }
  return LLM_PROVIDERS[provider].model;
}

/**
 * 检查指定提供商是否可用（有配置API Key）
 */
export function isProviderAvailable(provider: LLMProvider): boolean {
  return !!getApiKey(provider);
}

/**
 * 获取可用的提供商列表
 */
export function getAvailableProviders(): LLMConfig[] {
  return Object.values(LLM_PROVIDERS).filter(
    (config) => config.enabled && isProviderAvailable(config.provider)
  );
}
