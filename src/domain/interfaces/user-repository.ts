import type { UserProfile } from "../entities/user-profile";

export interface UserRepository {
  findById(userId: string): Promise<UserProfile | null>;

  findBySessionId(sessionId: string): Promise<UserProfile | null>;

  save(profile: UserProfile): Promise<void>;

  update(profile: UserProfile): Promise<void>;
}
