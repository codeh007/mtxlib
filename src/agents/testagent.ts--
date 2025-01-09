import type { Runnable } from "@langchain/core/runnables";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";

import { pull } from "langchain/hub";
import type { IAgentCtx } from "./agentctx";

import type { ChatPromptTemplate } from "@langchain/core/prompts";

export class TestAgent {
  constructor(private agentCtx?: IAgentCtx) {}
  async runnable(): Promise<Runnable> {
    const tools = [];
    const llm = await this.agentCtx.getLlm();
    //@ts-ignore
    const prompt = await pull<ChatPromptTemplate>(
      "hwchase17/openai-functions-agent",
    );
    const agent = await createOpenAIFunctionsAgent({
      llm,
      tools: [],
      //@ts-ignore
      prompt,
    });

    const agentExecutor = new AgentExecutor({
      agent,
      //@ts-ignore
      tools: [],
    }).withConfig({ runName: "Agent" });
    //@ts-ignore
    return agentExecutor;
  }
}
