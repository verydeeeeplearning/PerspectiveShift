import type { TextSegmenter } from "@/domain/interfaces/text-segmenter";
import { TextSegment } from "@/domain/value-objects/text-segment";

const CONJUNCTIONS = [
  "하지만",
  "그래서",
  "다만",
  "그러나",
  "그런데",
  "그렇지만",
  "반면에",
  "그럼에도",
];

export class KoreanTextSegmenter implements TextSegmenter {
  segment(text: string): TextSegment[] {
    if (!text || text.trim().length === 0) {
      return [];
    }

    // Step 1: Split on sentence-ending punctuation (., ?, !)
    // We keep the delimiter attached to the preceding text.
    const sentenceParts = this.splitOnPunctuation(text);

    // Step 2: Further split on conjunctions
    const allParts: string[] = [];
    for (const part of sentenceParts) {
      const conjunctionSplit = this.splitOnConjunctions(part);
      allParts.push(...conjunctionSplit);
    }

    // Step 3: Build TextSegment objects with correct indices
    const segments: TextSegment[] = [];
    let currentIndex = 0;
    for (let i = 0; i < allParts.length; i++) {
      const partText = allParts[i];
      if (partText.length === 0) continue;

      segments.push(
        new TextSegment(
          `seg-${segments.length}`,
          partText,
          currentIndex,
          currentIndex + partText.length,
          false,
        ),
      );
      currentIndex += partText.length;
    }

    return segments;
  }

  private splitOnPunctuation(text: string): string[] {
    // Split after . ? ! while keeping the delimiter with the preceding text
    const parts: string[] = [];
    let current = "";

    for (let i = 0; i < text.length; i++) {
      current += text[i];
      if (
        (text[i] === "." || text[i] === "?" || text[i] === "!") &&
        i < text.length - 1
      ) {
        parts.push(current);
        current = "";
      }
    }

    if (current.length > 0) {
      parts.push(current);
    }

    return parts;
  }

  private splitOnConjunctions(text: string): string[] {
    // Find conjunction positions preceded by whitespace
    const conjunctionPattern = new RegExp(
      `(\\s)(${CONJUNCTIONS.join("|")})`,
      "g",
    );

    const splitPoints: number[] = [];
    let match: RegExpExecArray | null;

    while ((match = conjunctionPattern.exec(text)) !== null) {
      // Split at the whitespace before the conjunction
      splitPoints.push(match.index);
    }

    if (splitPoints.length === 0) {
      return [text];
    }

    const parts: string[] = [];
    let start = 0;
    for (const point of splitPoints) {
      if (point > start) {
        parts.push(text.slice(start, point));
      }
      start = point;
    }
    if (start < text.length) {
      parts.push(text.slice(start));
    }

    return parts;
  }
}
