import {
  AIMessage,
  type BaseMessage,
  HumanMessage
} from "@langchain/core/messages";

// MessagesAnnotation coerces all message likes to base message classes
function swapRoles(messages: BaseMessage[]) {
  return messages.map((m) =>
    m instanceof AIMessage
      ? new HumanMessage({ content: m.content })
      : new AIMessage({ content: m.content }),
  );
}