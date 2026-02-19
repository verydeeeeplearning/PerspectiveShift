import { Microcopy, type MicrocopyContext, type MicrocopyTone } from "@/domain/value-objects/microcopy";

interface GetMicrocopyInput {
  context: MicrocopyContext;
  index?: number;
}

interface GetMicrocopyResult {
  text: string;
  tone: MicrocopyTone;
  context: MicrocopyContext;
}

export class GetMicrocopyForContextUseCase {
  execute(input: GetMicrocopyInput): GetMicrocopyResult {
    const mc = Microcopy.forContext(input.context, input.index);
    return { text: mc.text, tone: mc.tone, context: mc.context };
  }
}
