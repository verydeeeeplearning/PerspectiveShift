import type { StanceVector } from "./stance-vector";
import type { AnchorType } from "../value-objects/anchor-type";

export type ConversationStyle = "logical" | "emotional" | "humorous" | "careful";

export interface PersonaProfileProps {
  id: string;
  name: string;
  ageGroup: string;
  jobCategory: string;
  stanceLabel: string;
  description: string;
  conversationStyle: ConversationStyle;
  stanceVector: StanceVector;
  experienceBank: string[];
}

export class PersonaProfile {
  readonly id: string;
  readonly name: string;
  readonly ageGroup: string;
  readonly jobCategory: string;
  readonly stanceLabel: string;
  readonly description: string;
  readonly conversationStyle: ConversationStyle;
  readonly stanceVector: StanceVector;
  readonly experienceBank: readonly string[];

  private constructor(props: PersonaProfileProps) {
    this.id = props.id;
    this.name = props.name;
    this.ageGroup = props.ageGroup;
    this.jobCategory = props.jobCategory;
    this.stanceLabel = props.stanceLabel;
    this.description = props.description;
    this.conversationStyle = props.conversationStyle;
    this.stanceVector = props.stanceVector;
    this.experienceBank = Object.freeze([...props.experienceBank]);
  }

  static create(props: PersonaProfileProps): PersonaProfile {
    if (!props.id.trim()) throw new Error("PersonaProfile id must not be empty");
    if (!props.name.trim()) throw new Error("PersonaProfile name must not be empty");
    return new PersonaProfile(props);
  }

  toAnchorAttributes(): Array<{ type: AnchorType; value: string }> {
    return [
      { type: "age_group", value: this.ageGroup },
      { type: "job_category", value: this.jobCategory },
    ];
  }
}
