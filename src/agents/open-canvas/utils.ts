import type { LangGraphRunnableConfig } from "@langchain/langgraph";
import type { Artifact } from "mtxuilib/types/index.js";
import { getModelConfig } from "../agentUtils";
import { initChatModel } from "langchain/chat_models/universal";

export const formatArtifacts = (
  messages: Artifact[],
  truncate?: boolean,
): string =>
  messages
    .map((artifact) => {
      const content = truncate
        ? `${artifact.content.slice(0, 500)}${artifact.content.length > 500 ? "..." : ""}`
        : artifact.content;
      return `Title: ${artifact.title}\nID: ${artifact.id}\nContent: ${content}`;
    })
    .join("\n\n");

export async function getModelFromConfig(
  config: LangGraphRunnableConfig,
  extra?: {
    temperature?: number;
    maxTokens?: number;
  },
) {
  const { temperature = 0.5, maxTokens } = extra || {};
  const { modelName, modelProvider, azureConfig, apiKey } =
    getModelConfig(config);
  return await initChatModel(modelName, {
    modelProvider,
    temperature,
    maxTokens,
    ...(apiKey ? { apiKey } : {}),
    ...(azureConfig != null
      ? {
          azureOpenAIApiKey: azureConfig.azureOpenAIApiKey,
          azureOpenAIApiInstanceName: azureConfig.azureOpenAIApiInstanceName,
          azureOpenAIApiDeploymentName:
            azureConfig.azureOpenAIApiDeploymentName,
          azureOpenAIApiVersion: azureConfig.azureOpenAIApiVersion,
          azureOpenAIBasePath: azureConfig.azureOpenAIBasePath,
        }
      : {}),
  });
}
