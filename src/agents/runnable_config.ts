import { Annotation } from "@langchain/langgraph";
export const ConfigurableAnnotation = Annotation.Root({
  expectedField: Annotation<string>,
});
