import { DomainError } from "../errors/domain-errors";
import type { AnchorType } from "./anchor-type";

export class AnchorAttribute {
  readonly type: AnchorType;
  readonly value: string;

  private constructor(type: AnchorType, value: string) {
    this.type = type;
    this.value = value;
  }

  static create(type: AnchorType, value: string): AnchorAttribute {
    if (!value.trim()) {
      throw new DomainError("Anchor attribute value cannot be empty");
    }
    return new AnchorAttribute(type, value.trim());
  }

  matches(other: AnchorAttribute): boolean {
    return this.type === other.type && this.value === other.value;
  }
}
