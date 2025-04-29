import { VystaClient } from "@datavysta/vysta-client";

export class AuthService {
  private client: VystaClient;

  constructor(client: VystaClient) {
    this.client = client;
  }

  async logout(): Promise<void> {
    return this.client.logout();
  }

  async login(username: string, password: string): Promise<any> {
    return this.client.login(username, password);
  }

  async getSignInMethods() {
    return this.client.getSignInMethods();
  }

  async getAuthorizeUrl(providerId: string): Promise<string> {
    return this.client.getAuthorizeUrl(providerId);
  }

  async exchangeToken(token: string): Promise<any> {
    return this.client.exchangeToken(token);
  }

  get clientInstance() {
    return this.client;
  }
} 