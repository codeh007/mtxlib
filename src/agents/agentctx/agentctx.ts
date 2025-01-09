import type { IAgentCtx } from ".";
import { getLlm } from "mtxuilib/llm/llm.js";

export class AgentCtx implements IAgentCtx {
  getLlm() {
    return getLlm();
  }

  emit() {
    console.log("TODO: agent ctx emit");
  }

  runAgentStep(stepName: string, input: any) {
    console.log("TODO: runAgentStep");
  }
}
