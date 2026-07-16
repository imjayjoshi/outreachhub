import { GoogleService } from "./google.service.js";
import { JwtService } from "./jwt.service.js";
import { GoogleRepository } from "./google.repository.js";
import { User } from "@/modules/shared/database/entities/user.entity.js";

export class AuthService {
  constructor(
    private readonly googleRepository: GoogleRepository,
    private readonly googleService: GoogleService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Processes the Google strategy result payload to register or verify the user,
   * encrypting tokens, updating profiles, and generating an application JWT.
   */
  public async handleGoogleCallback(
    profile: any,
    accessToken: string,
    refreshToken?: string,
  ): Promise<{ user: User; token: string }> {
    const mappedDto = this.googleService.mapProfile(profile);

    // Look up by googleId first, and fall back to email for linking accounts
    let user = await this.googleRepository.findByGoogleId(mappedDto.googleId);
    if (!user) {
      user = await this.googleRepository.findByEmail(mappedDto.email);
    }

    const { nanoid } = await import("nanoid");

    // Securely encrypt the refresh token if returned by Google
    let encryptedRefreshToken: string | null = null;
    if (refreshToken) {
      encryptedRefreshToken = this.googleService.encryptToken(refreshToken);
    }

    const now = new Date();

    if (!user) {
      // Create new user
      user = await this.googleRepository.create({
        id: nanoid(),
        email: mappedDto.email,
        name: mappedDto.name,
        googleId: mappedDto.googleId,
        provider: mappedDto.provider,
        providerId: mappedDto.providerId,
        avatar: mappedDto.avatar,
        image: mappedDto.avatar, // keep existing image field aligned
        emailVerified: now,
        refreshToken: encryptedRefreshToken,
        lastLogin: now,
      });
    } else {
      // Link Google details and update profile info on existing account
      user.googleId = mappedDto.googleId;
      user.provider = mappedDto.provider;
      user.providerId = mappedDto.providerId;
      user.avatar = mappedDto.avatar;
      user.image = mappedDto.avatar;
      user.emailVerified = user.emailVerified || now;
      user.lastLogin = now;

      if (encryptedRefreshToken) {
        user.refreshToken = encryptedRefreshToken;
      }

      user = await this.googleRepository.save(user);
    }

    // Generate CareerFlow application-level JWT
    const token = this.jwtService.generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return { user, token };
  }
}
