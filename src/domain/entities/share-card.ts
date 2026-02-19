import type { ShareCardType } from "../value-objects/share-card-type";
import type { StanceDimension } from "../value-objects/stance-dimension";

const PRIVACY_DISCLAIMER = "이 카드는 개인정보 없이 생성됩니다. 원문 답변은 저장되지 않습니다.";
const DEFAULT_TOP_AXES_COUNT = 3;

export interface AliasInfo {
  key: string;
  label: string;
  emoji: string;
  description: string;
}

export interface MisperceptionData {
  dimension: StanceDimension;
  userPrediction: number;
  actualBaseline: number;
  gap: number;
  baselineLabel: string;
}

interface AliasCardInput {
  alias: AliasInfo;
  topDimensions: StanceDimension[];
}

interface ThoughtMapCardInput {
  vector: Record<StanceDimension, number>;
  selectedAxes?: StanceDimension[];
}

interface MisperceptionCardInput {
  dimension: StanceDimension;
  userPrediction: number;
  actualBaseline: number;
  baselineLabel: string;
}

export class ShareCard {
  readonly type: ShareCardType;
  readonly privacyDisclaimer: string;
  readonly alias?: AliasInfo;
  readonly topDimensions?: StanceDimension[];
  readonly selectedAxes?: StanceDimension[];
  readonly vectorSubset?: Partial<Record<StanceDimension, number>>;
  readonly misperception?: MisperceptionData;

  private constructor(props: {
    type: ShareCardType;
    alias?: AliasInfo;
    topDimensions?: StanceDimension[];
    selectedAxes?: StanceDimension[];
    vectorSubset?: Partial<Record<StanceDimension, number>>;
    misperception?: MisperceptionData;
  }) {
    this.type = props.type;
    this.privacyDisclaimer = PRIVACY_DISCLAIMER;
    this.alias = props.alias;
    this.topDimensions = props.topDimensions;
    this.selectedAxes = props.selectedAxes;
    this.vectorSubset = props.vectorSubset;
    this.misperception = props.misperception;
  }

  static alias(input: AliasCardInput): ShareCard {
    return new ShareCard({
      type: "ALIAS",
      alias: input.alias,
      topDimensions: input.topDimensions,
    });
  }

  static thoughtMap(input: ThoughtMapCardInput): ShareCard {
    const axes = input.selectedAxes ?? selectTopAxes(input.vector, DEFAULT_TOP_AXES_COUNT);
    const subset: Partial<Record<StanceDimension, number>> = {};
    for (const axis of axes) {
      subset[axis] = input.vector[axis];
    }

    return new ShareCard({
      type: "THOUGHT_MAP",
      selectedAxes: axes,
      vectorSubset: subset,
    });
  }

  static misperception(input: MisperceptionCardInput): ShareCard {
    return new ShareCard({
      type: "MISPERCEPTION",
      misperception: {
        dimension: input.dimension,
        userPrediction: input.userPrediction,
        actualBaseline: input.actualBaseline,
        gap: Math.abs(input.actualBaseline - input.userPrediction),
        baselineLabel: input.baselineLabel,
      },
    });
  }
}

function selectTopAxes(
  vector: Record<StanceDimension, number>,
  count: number,
): StanceDimension[] {
  return (Object.entries(vector) as [StanceDimension, number][])
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, count)
    .map(([dim]) => dim);
}
