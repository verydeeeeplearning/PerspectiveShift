import type { TextSegment } from "../value-objects/text-segment";

export interface TextSegmenter {
  segment(text: string): TextSegment[];
}
