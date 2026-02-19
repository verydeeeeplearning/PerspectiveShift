import type { SupabaseClient } from "@supabase/supabase-js";
import type { SafetyRepository } from "@/domain/interfaces/safety-repository";
import { SafetyReport } from "@/domain/entities/safety-report";
import type { SafetyReason } from "@/domain/value-objects/safety-reason";
import type { SafetyReportStatus } from "@/domain/value-objects/safety-report-status";

interface SafetyReportRow {
  id: string;
  reporter_id: string;
  reported_id: string;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export class SupabaseSafetyRepository implements SafetyRepository {
  constructor(private readonly client: SupabaseClient) {}

  async save(report: SafetyReport): Promise<void> {
    const { error } = await this.client
      .from("safety_reports")
      .insert({
        id: report.id,
        reporter_id: report.reporterId,
        reported_id: report.reportedId,
        reason: report.reason,
        description: report.description,
        status: report.status,
        created_at: report.createdAt.toISOString(),
        updated_at: report.updatedAt.toISOString(),
      });

    if (error)
      throw new Error(`Failed to save safety report: ${error.message}`);
  }

  async findById(id: string): Promise<SafetyReport | null> {
    const { data, error } = await this.client
      .from("safety_reports")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to find safety report: ${error.message}`);
    }

    return this.rowToReport(data as SafetyReportRow);
  }

  async findByReporter(
    reporterId: string,
  ): Promise<SafetyReport[]> {
    const { data, error } = await this.client
      .from("safety_reports")
      .select("*")
      .eq("reporter_id", reporterId)
      .order("created_at", { ascending: false });

    if (error)
      throw new Error(
        `Failed to find safety reports: ${error.message}`,
      );

    return (data ?? []).map((row) =>
      this.rowToReport(row as SafetyReportRow),
    );
  }

  private rowToReport(row: SafetyReportRow): SafetyReport {
    return SafetyReport.create({
      id: row.id,
      reporterId: row.reporter_id,
      reportedId: row.reported_id,
      reason: row.reason as SafetyReason,
      description: row.description,
      status: row.status as SafetyReportStatus,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}
