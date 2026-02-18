export interface DisclosureSettingOutput {
  friendshipId: string;
  fromUserId: string;
  toUserId: string;
  level: number;
  levelLabel: string;
}

export interface DisclosurePairOutput {
  myDisclosure: DisclosureSettingOutput;
  theirDisclosure: DisclosureSettingOutput;
}
