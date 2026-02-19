import type { SafetyRepository } from "@/domain/interfaces/safety-repository";
import type { EventTracker } from "@/domain/interfaces/event-tracker";
import type { SafetyReportOutput } from "../dtos/safety-output";
import type { SafetyReason } from "@/domain/value-objects/safety-reason";
import { SafetyReport } from "@/domain/entities/safety-report";
import { RELATIONSHIP_EVENT_TYPES } from "@/domain/value-objects/relationship-event-type";

export interface SubmitSafetyReportDeps {
  safetyRepository: SafetyRepository;
  eventTracker?: EventTracker;
}

export class SubmitSafetyReportUseCase {
  private deps: SubmitSafetyReportDeps;

  constructor(deps: SubmitSafetyReportDeps) {
    this.deps = deps;
  }

  async execute(
    reporterId: string,
    reportedId: string,
    reason: SafetyReason,
    description: string | null,
  ): Promise<SafetyReportOutput> {
    const now = new Date();
    const report = SafetyReport.create({
      id: crypto.randomUUID(),
      reporterId,
      reportedId,
      reason,
      description,
      status: "OPEN",
      createdAt: now,
      updatedAt: now,
    });

    await this.deps.safetyRepository.save(report);

    this.deps.eventTracker
      ?.track(RELATIONSHIP_EVENT_TYPES.SAFETY_REPORT_SUBMITTED, reporterId, reportedId, { reason })
      .catch(() => {});

    return {
      id: report.id,
      reporterId: report.reporterId,
      reportedId: report.reportedId,
      reason: report.reason,
      status: report.status,
      createdAt: report.createdAt.toISOString(),
    };
  }
}
