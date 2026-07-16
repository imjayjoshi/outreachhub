import crypto from "crypto";
import { google } from "googleapis";
import { GoogleUserDto } from "./dto/google-user.dto.js";

export class GoogleService {
  private encryptionKey: Buffer;

  constructor() {
    const secret =
      process.env.ENCRYPTION_KEY ||
      process.env.JWT_SECRET ||
      "default_auth_secret_key_123";
    this.encryptionKey = crypto.createHash("sha256").update(secret).digest();
  }

  /**
   * Encrypts the refresh token using AES-256-GCM.
   */
  public encryptToken(token: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", this.encryptionKey, iv);
    const encrypted = Buffer.concat([
      cipher.update(token, "utf8"),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
  }

  /**
   * Decrypts the refresh token using AES-256-GCM.
   */
  public decryptToken(encryptedToken: string): string {
    const parts = encryptedToken.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted token format");
    }
    const iv = Buffer.from(parts[0], "hex");
    const tag = Buffer.from(parts[1], "hex");
    const encrypted = Buffer.from(parts[2], "hex");

    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      this.encryptionKey,
      iv,
    );
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  }

  /**
   * Refreshes the Google access token using the stored refresh token.
   */
  public async getAccessTokenFromRefreshToken(refreshToken: string): Promise<{
    accessToken: string;
    expiryDate: Date | null;
  }> {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL,
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const response = await oauth2Client.getAccessToken();
    const credentials = oauth2Client.credentials;
    const expiryDate = credentials.expiry_date
      ? new Date(credentials.expiry_date)
      : null;

    if (!response.token) {
      throw new Error("Failed to retrieve new access token from Google");
    }

    return {
      accessToken: response.token,
      expiryDate,
    };
  }

  /**
   * Maps Google profile details into DTO structure.
   */
  public mapProfile(profile: any): GoogleUserDto {
    const email =
      profile.emails && profile.emails[0] ? profile.emails[0].value : "";
    const avatar =
      profile.photos && profile.photos[0] ? profile.photos[0].value : null;
    const name =
      profile.displayName ||
      `${profile.name?.givenName || ""} ${profile.name?.familyName || ""}`.trim() ||
      null;

    return new GoogleUserDto({
      googleId: profile.id,
      email,
      name,
      avatar,
      provider: "google",
      providerId: profile.id,
    });
  }
}
