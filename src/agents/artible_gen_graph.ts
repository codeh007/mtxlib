import type {
  AIMessage,
  AIMessageChunk,
  BaseMessageLike,
} from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { Runnable } from "@langchain/core/runnables";
import {
  Annotation,
  type MessagesAnnotation,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { getLlm } from "mtxuilib/llm/llm.js";

export const BlogAutoGraphInputAnnotation = Annotation.Root({
  blogId: Annotation<string>,
  BlogData: Annotation<any>,
  previewUrl: Annotation<string>,
  error: Annotation<string>,
});

//博客基本信息初始化
const BlogInitNode = (_state: typeof BlogAutoGraphInputAnnotation.State) => {
  if (!_state.BlogData) {
    if (!_state.blogId) {
      return {
        error: "blog id require",
      };
    }
  }
  //TODO: 加载博客基本数据
  return {
    BlogData: {
      title: "美食博客",
      description: "专业的美食博客，介绍点心的做法",
    },
  };
};

async function myChatBot(messages: BaseMessageLike[]): Promise<AIMessageChunk> {
  const systemMessage = {
    role: "system",
    content: "You are a customer support agent for an airline.",
  };
  const allMessages = [systemMessage, ...messages];

  const llm = getLlm();
  const response = await llm.invoke(allMessages);
  return response;
}
async function chatBotNode(state: typeof MessagesAnnotation.State) {
  const messages = state.messages;
  const chatBotResponse = await myChatBot(messages);
  return { messages: [chatBotResponse] };
}

async function createSimulatedUser(): Promise<
  Runnable<{ messages: BaseMessageLike[] }, AIMessage>
> {
  const systemPromptTemplate = `You are a customer of an airline company. You are interacting with a user who is a customer support person

{instructions}

If you have nothing more to add to the conversation, you must respond only with a single word: "FINISHED"`;

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPromptTemplate],
    ["placeholder", "{messages}"],
  ]);

  const instructions = `Your name is Harrison. You are trying to get a refund for the trip you took to Alaska.
You want them to give you ALL the money back. Be extremely persistent. This trip happened 5 years ago.`;

  const partialPrompt = await prompt.partial({ instructions });
  const llm = getLlm();

  const simulatedUser = partialPrompt.pipe(llm);
  return simulatedUser;
}

//Graph
export function buildArticleGenGraph() {
  const workflow = new StateGraph(BlogAutoGraphInputAnnotation)
    .addNode("blogInit", BlogInitNode)
    .addNode("chatbot", chatBotNode)
    .addEdge(START, "chatbot");
  return workflow;
}
