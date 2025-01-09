import type { LangGraphRunnableConfig } from "@langchain/langgraph";
import { isArtifactMarkdownContent } from "mtxuilib/lib/artifact_content_types.js";
import type { Reflections } from "mtxuilib/types/index.js";
import {
  ensureStoreInConfig,
  formatReflections,
  getModelFromConfig,
} from "../../utils";
import { FOLLOWUP_ARTIFACT_PROMPT } from "../prompts";
import type {
  OpenCanvasGraphAnnotation,
  OpenCanvasGraphReturnType,
} from "../state";
import { getArtifactContent } from "../../graph_utils";

/**
 * Generate a followup message after generating or updating an artifact.
 */
export const generateFollowup = async (
  state: typeof OpenCanvasGraphAnnotation.State,
  config: LangGraphRunnableConfig,
): Promise<OpenCanvasGraphReturnType> => {
  const smallModel = await getModelFromConfig(config, {
    maxTokens: 250,
  });

  const store = ensureStoreInConfig(config);
  const assistantId = config.configurable?.assistant_id;
  if (!assistantId) {
    throw new Error("`assistant_id` not found in configurable");
  }
  const memoryNamespace = ["memories", assistantId];
  const memoryKey = "reflection";
  const memories = await store.get(memoryNamespace, memoryKey);
  const memoriesAsString = memories?.value
    ? formatReflections(memories.value as Reflections, {
        onlyContent: true,
      })
    : "No reflections found.";

  const currentArtifactContent = state.artifact
    ? getArtifactContent(state.artifact)
    : undefined;

  const artifactContent = currentArtifactContent
    ? isArtifactMarkdownContent(currentArtifactContent)
      ? currentArtifactContent.fullMarkdown
      : currentArtifactContent.code
    : undefined;

  const formattedPrompt = FOLLOWUP_ARTIFACT_PROMPT.replace(
    "{artifactContent}",
    artifactContent || "No artifacts generated yet.",
  )
    .replace("{reflections}", memoriesAsString)
    .replace(
      "{conversation}",
      state.messages
        .map((msg) => `<${msg.getType()}>\n${msg.content}\n</${msg.getType()}>`)
        .join("\n\n"),
    );

  // TODO: Include the chat history as well.
  const response = await smallModel.invoke([
    { role: "user", content: formattedPrompt },
  ]);

  return {
    messages: [response],
  };
};
