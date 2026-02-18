import { describe, it, expect } from "vitest";
import { RegexPiiScrubber } from "../regex-pii-scrubber";

describe("RegexPiiScrubber", () => {
  const scrubber = new RegexPiiScrubber();

  describe("전화번호", () => {
    it("scrubs 010-1234-5678", () => {
      const result = scrubber.scrub("제 번호는 010-1234-5678입니다");
      expect(result.scrubbed).toBe("제 번호는 [전화번호]입니다");
      expect(result.piiDetected).toBe(true);
      expect(result.detectedTypes).toContain("전화번호");
    });

    it("scrubs 01012345678 (no dashes)", () => {
      const result = scrubber.scrub("01012345678로 연락주세요");
      expect(result.scrubbed).toContain("[전화번호]");
    });

    it("scrubs 010-123-4567 (3-digit middle)", () => {
      const result = scrubber.scrub("010-123-4567");
      expect(result.scrubbed).toBe("[전화번호]");
    });
  });

  describe("이메일", () => {
    it("scrubs email addresses", () => {
      const result = scrubber.scrub(
        "이메일은 test@example.com입니다",
      );
      expect(result.scrubbed).toBe("이메일은 [이메일]입니다");
      expect(result.detectedTypes).toContain("이메일");
    });

    it("scrubs complex email", () => {
      const result = scrubber.scrub("user.name+tag@domain.co.kr");
      expect(result.scrubbed).toBe("[이메일]");
    });
  });

  describe("주민등록번호", () => {
    it("scrubs 6-7 digit pattern", () => {
      const result = scrubber.scrub("주민번호 900101-1234567");
      expect(result.scrubbed).toBe("주민번호 [주민등록번호]");
      expect(result.detectedTypes).toContain("주민등록번호");
    });

    it("scrubs with spaces around dash", () => {
      const result = scrubber.scrub("900101 - 1234567");
      expect(result.scrubbed).toBe("[주민등록번호]");
    });
  });

  describe("URL", () => {
    it("scrubs HTTP URLs", () => {
      const result = scrubber.scrub(
        "참고: https://example.com/page",
      );
      expect(result.scrubbed).toBe("참고: [URL]");
      expect(result.detectedTypes).toContain("URL");
    });
  });

  describe("카드번호", () => {
    it("scrubs card number", () => {
      const result = scrubber.scrub("1234-5678-9012-3456");
      expect(result.scrubbed).toBe("[카드번호]");
      expect(result.detectedTypes).toContain("카드번호");
    });
  });

  describe("복합 PII", () => {
    it("scrubs multiple PII types in one text", () => {
      const result = scrubber.scrub(
        "제 이메일은 test@mail.com이고 전화번호는 010-1234-5678입니다",
      );
      expect(result.scrubbed).toBe(
        "제 이메일은 [이메일]이고 전화번호는 [전화번호]입니다",
      );
      expect(result.detectedTypes).toContain("이메일");
      expect(result.detectedTypes).toContain("전화번호");
    });
  });

  describe("PII 없는 텍스트", () => {
    it("returns original text when no PII found", () => {
      const text = "한국 사회에서 가장 시급한 문제는 주거 안정입니다";
      const result = scrubber.scrub(text);
      expect(result.scrubbed).toBe(text);
      expect(result.piiDetected).toBe(false);
      expect(result.detectedTypes).toHaveLength(0);
    });

    it("preserves Korean text without PII", () => {
      const text = "소득 불평등을 해소하기 위해 교육 기회를 확대해야 합니다";
      const result = scrubber.scrub(text);
      expect(result.scrubbed).toBe(text);
    });
  });
});
