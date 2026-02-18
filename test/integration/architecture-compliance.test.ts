import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

function getTypeScriptFiles(dir: string): string[] {
  const files: string[] = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        if (entry === "__tests__" || entry === "node_modules") continue;
        files.push(...getTypeScriptFiles(fullPath));
      } else if (entry.endsWith(".ts") && !entry.endsWith(".test.ts")) {
        files.push(fullPath);
      }
    }
  } catch {
    // directory doesn't exist
  }
  return files;
}

describe("Architecture Compliance (ARCH-001)", () => {
  const domainDir = join(process.cwd(), "src/domain");
  const domainFiles = getTypeScriptFiles(domainDir);

  it("domain layer has production files", () => {
    expect(domainFiles.length).toBeGreaterThan(0);
  });

  it("domain layer imports no external packages", () => {
    const externalImportPattern =
      /from\s+["'](?!\.\.?\/)[^@][^"']*["']/;

    for (const file of domainFiles) {
      const content = readFileSync(file, "utf-8");
      const lines = content.split("\n");
      for (const line of lines) {
        if (line.includes("import") && externalImportPattern.test(line)) {
          throw new Error(
            `Domain file ${file} has external import: ${line.trim()}`,
          );
        }
      }
    }
  });

  it("domain layer does not import from application, infrastructure, or app", () => {
    const forbiddenPatterns = [
      /@\/application\//,
      /@\/infrastructure\//,
      /@\/app\//,
    ];

    for (const file of domainFiles) {
      const content = readFileSync(file, "utf-8");
      for (const pattern of forbiddenPatterns) {
        if (pattern.test(content)) {
          throw new Error(
            `Domain file ${file} imports from forbidden layer: ${pattern}`,
          );
        }
      }
    }
  });

  it("application layer does not import from infrastructure or app", () => {
    const appDir = join(process.cwd(), "src/application");
    const appFiles = getTypeScriptFiles(appDir);

    const forbiddenPatterns = [
      /@\/infrastructure\//,
      /@\/app\//,
    ];

    for (const file of appFiles) {
      const content = readFileSync(file, "utf-8");
      for (const pattern of forbiddenPatterns) {
        if (pattern.test(content)) {
          throw new Error(
            `Application file ${file} imports from forbidden layer: ${pattern}`,
          );
        }
      }
    }
  });
});

describe("File Size Compliance (ARCH-004)", () => {
  const srcDir = join(process.cwd(), "src");

  function getAllTsFiles(dir: string): string[] {
    const files: string[] = [];
    try {
      const entries = readdirSync(dir);
      for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          if (entry === "node_modules" || entry === ".next") continue;
          files.push(...getAllTsFiles(fullPath));
        } else if (
          (entry.endsWith(".ts") || entry.endsWith(".tsx")) &&
          !entry.endsWith(".test.ts") &&
          !entry.endsWith(".test.tsx")
        ) {
          files.push(fullPath);
        }
      }
    } catch {
      // skip
    }
    return files;
  }

  it("no production file exceeds 300 lines", () => {
    const files = getAllTsFiles(srcDir);
    for (const file of files) {
      const content = readFileSync(file, "utf-8");
      const lineCount = content.split("\n").length;
      if (lineCount > 300) {
        throw new Error(
          `File ${file} has ${lineCount} lines (max 300)`,
        );
      }
    }
  });
});
