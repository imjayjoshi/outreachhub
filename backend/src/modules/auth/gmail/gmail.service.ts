import { google } from "googleapis";
import { GoogleService } from "../google/google.service.js";

export class GmailService {
  constructor(private readonly googleService: GoogleService) {}

  /**
   * Creates an authenticated Gmail API client using a stored refresh token.
   */
  public async getGmailClient(encryptedRefreshToken: string) {
    const refreshToken = this.googleService.decryptToken(encryptedRefreshToken);
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL,
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    return google.gmail({ version: "v1", auth: oauth2Client });
  }

  /**
   * Send an email using Gmail API.
   * Note: sending is not fully implemented in this phase, only stub structure.
   */
  public async sendEmail(
    encryptedRefreshToken: string,
    recipient: string,
    subject: string,
    body: string,
  ): Promise<void> {
    console.log(
      `[gmail.service] Stub: sendEmail requested for ${recipient}. Subject: ${subject}`,
    );
    // Future logic:
    // const client = await this.getGmailClient(encryptedRefreshToken);
    // ...
  }
}
