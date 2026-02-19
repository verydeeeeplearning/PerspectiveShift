import type { LightProtocolSession } from "../entities/light-protocol-session";

export interface LightProtocolRepository {
  save(session: LightProtocolSession): Promise<void>;
  findById(id: string): Promise<LightProtocolSession | null>;
  findByFriendship(friendshipId: string): Promise<LightProtocolSession[]>;
  findActiveByFriendship(
    friendshipId: string,
  ): Promise<LightProtocolSession | null>;
  update(session: LightProtocolSession): Promise<void>;
}
