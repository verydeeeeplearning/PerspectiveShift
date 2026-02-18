import type { SafetyReport } from "../entities/safety-report";

export interface SafetyRepository {
  save(report: SafetyReport): Promise<void>;

  findById(id: string): Promise<SafetyReport | null>;

  findByReporter(reporterId: string): Promise<SafetyReport[]>;
}
