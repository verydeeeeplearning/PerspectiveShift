import { DisclosureLevel } from "../value-objects/disclosure-level";
import { InvalidDisclosureLevelError } from "../errors/domain-errors";

export interface DisclosureSettingProps {
  id: string;
  friendshipId: string;
  fromUserId: string;
  toUserId: string;
  level: DisclosureLevel;
  updatedAt: Date;
}

export class DisclosureSetting {
  readonly id: string;
  readonly friendshipId: string;
  readonly fromUserId: string;
  readonly toUserId: string;
  private _level: DisclosureLevel;
  private _updatedAt: Date;

  private constructor(props: DisclosureSettingProps) {
    this.id = props.id;
    this.friendshipId = props.friendshipId;
    this.fromUserId = props.fromUserId;
    this.toUserId = props.toUserId;
    this._level = props.level;
    this._updatedAt = props.updatedAt;
  }

  get level(): DisclosureLevel {
    return this._level;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  static create(props: DisclosureSettingProps): DisclosureSetting {
    return new DisclosureSetting(props);
  }

  escalateTo(newLevel: DisclosureLevel): void {
    if (!this._level.canEscalateTo(newLevel)) {
      throw new InvalidDisclosureLevelError(
        this._level.value,
        newLevel.value,
      );
    }
    this._level = newLevel;
    this._updatedAt = new Date();
  }
}
