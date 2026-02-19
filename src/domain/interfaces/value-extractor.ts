export interface ValueExtractor {
  extractValuePriority(text: string): Promise<string[]>;
}
