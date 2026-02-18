export interface ScrubResult {
  scrubbed: string;
  piiDetected: boolean;
  detectedTypes: string[];
}

export interface PiiScrubber {
  scrub(text: string): ScrubResult;
}
