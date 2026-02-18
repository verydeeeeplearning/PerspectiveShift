export interface RealtimeBroadcaster {
  broadcast(channel: string, event: string, payload: Record<string, unknown>): Promise<void>;
}
