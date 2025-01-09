import { ChatOpenAI, ChatOpenAICallOptions } from "@langchain/openai"

export interface IAgentCtx{
  emit:(data)=>void
  getLlm:()=>ChatOpenAI<ChatOpenAICallOptions>
  runAgentStep:(stepName:string, input:any)=>void
}