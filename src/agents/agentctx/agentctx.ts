import type { IAgentCtx } from '.';
import { getLlm } from "../../llm/llm";


export class AgentCtx implements IAgentCtx {
  getLlm() {
    return getLlm();
  }

  emit(){
    console.log("TODO: agent ctx emit")
  }

  runAgentStep(stepName:string, input:any){
    console.log("TODO: runAgentStep")
  }
}
