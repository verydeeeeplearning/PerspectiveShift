export type AnchorType = "gender" | "job_category" | "age_group" | "region";

const ANCHOR_LABELS: Record<AnchorType, string> = {
  gender: "성별",
  job_category: "직업군",
  age_group: "연령대",
  region: "지역",
};

export function getAnchorLabel(type: AnchorType): string {
  return ANCHOR_LABELS[type];
}

export const ALL_ANCHOR_TYPES: readonly AnchorType[] = ["gender", "job_category", "age_group", "region"];
