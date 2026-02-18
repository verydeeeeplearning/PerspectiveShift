import type { PiiScrubber, ScrubResult } from "@/domain/interfaces/pii-scrubber";

interface PiiPattern {
  name: string;
  regex: RegExp;
  replacement: string;
}

const PII_PATTERNS: PiiPattern[] = [
  {
    name: "주민등록번호",
    regex: /\d{6}\s*-\s*[1-4]\d{6}/g,
    replacement: "[주민등록번호]",
  },
  {
    name: "전화번호",
    regex: /01[016789]-?\d{3,4}-?\d{4}/g,
    replacement: "[전화번호]",
  },
  {
    name: "일반전화",
    regex: /0\d{1,2}-?\d{3,4}-?\d{4}/g,
    replacement: "[전화번호]",
  },
  {
    name: "이메일",
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    replacement: "[이메일]",
  },
  {
    name: "URL",
    regex: /https?:\/\/[^\s]+/g,
    replacement: "[URL]",
  },
  {
    name: "카드번호",
    regex: /\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/g,
    replacement: "[카드번호]",
  },
  {
    name: "계좌번호",
    regex: /\d{3,6}-\d{2,6}-\d{2,6}/g,
    replacement: "[계좌번호]",
  },
];

export class RegexPiiScrubber implements PiiScrubber {
  scrub(text: string): ScrubResult {
    let scrubbed = text;
    const detectedTypes: string[] = [];

    for (const pattern of PII_PATTERNS) {
      const re = new RegExp(pattern.regex.source, pattern.regex.flags);
      const replaced = scrubbed.replace(re, pattern.replacement);
      if (replaced !== scrubbed) {
        detectedTypes.push(pattern.name);
        scrubbed = replaced;
      }
    }

    return {
      scrubbed,
      piiDetected: detectedTypes.length > 0,
      detectedTypes,
    };
  }
}
