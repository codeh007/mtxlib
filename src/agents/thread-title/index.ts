import {
  type LangGraphRunnableConfig,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { Client } from "@langchain/langgraph-sdk";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { isArtifactMarkdownContent } from "mtxuilib/lib/artifact_content_types.js";
import { getArtifactContent } from "../graph_utils";
import { TITLE_SYSTEM_PROMPT, TITLE_USER_PROMPT } from "./prompts";
import {
  TitleGenerationAnnotation,
  type TitleGenerationReturnType,
} from "./state";

export const generateTitle = async (
  state: typeof TitleGenerationAnnotation.State,
  config: LangGraphRunnableConfig,
): Promise<TitleGenerationReturnType> => {
  const threadId = config.configurable?.open_canvas_thread_id;

  if (!threadId) {
    throw new Error("open_canvas_thread_id not found in configurable");
  }

  const generateTitleTool = {
    name: "generate_title",
    description: "Generate a concise title for the conversation.",
    schema: z.object({
      title: z.string().describe("The generated title for the conversation."),
    }),
  };

  const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
  }).bindTools([generateTitleTool], {
    tool_choice: "generate_title",
  });

  const currentArtifactContent = state.artifact
    ? getArtifactContent(state.artifact)
    : undefined;

  const artifactContent = currentArtifactContent
    ? isArtifactMarkdownContent(currentArtifactContent)
      ? currentArtifactContent.fullMarkdown
      : currentArtifactContent.code
    : undefined;

  const artifactContext = artifactContent
    ? `An artifact was generated during this conversation:\n\n${artifactContent}`
    : "No artifact was generated during this conversation.";

  const formattedUserPrompt = TITLE_USER_PROMPT.replace(
    "{conversation}",
    state.messages
      .map((msg) => `<${msg.getType()}>\n${msg.content}\n</${msg.getType()}>`)
      .join("\n\n"),
  ).replace("{artifact_context}", artifactContext);

  const result = await model.invoke([
    {
      role: "system",
      content: TITLE_SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: formattedUserPrompt,
    },
  ]);

  const titleToolCall = result.tool_calls?.[0];
  if (!titleToolCall) {
    console.error("FAILED TO GENERATE TOOL CALL", result);
    throw new Error("Title generation tool call failed.");
  }

  const langGraphClient = new Client({
    apiUrl: `http://localhost:${process.env.PORT}`,
    defaultHeaders: {
      "X-API-KEY": process.env.LANGCHAIN_API_KEY,
    },
  });

  // Update thread metadata with the generated title
  await langGraphClient.threads.update(threadId, {
    metadata: {
      thread_title: titleToolCall.args.title,
    },
  });

  return {};
};

const builder = new StateGraph(TitleGenerationAnnotation)
  .addNode("title", generateTitle)
  .addEdge(START, "title");

export const graph = builder.compile().withConfig({ runName: "thread_title" });
