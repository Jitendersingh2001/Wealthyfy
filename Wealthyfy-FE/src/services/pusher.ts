import Pusher, { Channel } from "pusher-js";
import { keycloakService } from "@/services/keycloak";
import { config } from "@/config/config";
import { PUSHER_AUTH_ENDPOINT } from "@/services/api/endpoints";

class PusherService {
  // ---------------------------------------------------------
  // Private Properties
  // ---------------------------------------------------------
  private pusherClient: Pusher | null = null;
  private userChannel: Channel | null = null;

  // ---------------------------------------------------------
  // Initialization
  // ---------------------------------------------------------
  private async initClient(): Promise<Pusher> {
    if (this.pusherClient) return this.pusherClient;

    const token = await keycloakService.getValidToken();

    this.pusherClient = new Pusher(config.pusher.key, {
      cluster: config.pusher.cluster,
      forceTLS: true,
      authEndpoint: `${config.app.apiBaseUrl}/${PUSHER_AUTH_ENDPOINT}`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    return this.pusherClient;
  }

  // ---------------------------------------------------------
  // Subscription Management
  // ---------------------------------------------------------
  public async subscribe(userId: number): Promise<Channel> {
    if (this.userChannel) {
      await this.unsubscribe();
    }

    const client = await this.initClient();
    const channelName = `private-user-${userId}`;

    this.userChannel = client.subscribe(channelName);

    return new Promise((resolve, reject) => {
      this.userChannel!.bind("pusher:subscription_succeeded", () => {
        console.log(`Subscribed to ${channelName}`);
        resolve(this.userChannel!);
      });

      this.userChannel!.bind("pusher:subscription_error", (error: unknown) => {
        console.error(`Error subscribing to ${channelName}`, error);
        reject(error);
      });
    });
  }

  public async unsubscribe(): Promise<void> {
    if (!this.userChannel) return;

    const channelName = this.userChannel.name;
    this.pusherClient?.unsubscribe(channelName);
    this.userChannel = null;
    console.log(`Unsubscribed from ${channelName}`);
  }

  // ---------------------------------------------------------
  // Connection Lifecycle
  // ---------------------------------------------------------
  public disconnect(): void {
    if (!this.pusherClient) return;

    this.pusherClient.disconnect();
    this.pusherClient = null;
    this.userChannel = null;
    console.log("Pusher client disconnected");
  }

  // ---------------------------------------------------------
  // Accessors
  // ---------------------------------------------------------
  public getChannel(): Channel | null {
    return this.userChannel;
  }
}

// ---------------------------------------------------------
// Export Singleton Instance
// ---------------------------------------------------------
export const pusherService = new PusherService();
