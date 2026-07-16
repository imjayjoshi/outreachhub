import { Request, Response } from "express";
import { GoogleService } from "./google.service.js";
import { JwtService } from "./jwt.service.js";
import { AppDataSource } from "@/modules/shared/database/dataSource.js";
import { User } from "@/modules/shared/database/entities/user.entity.js";

export class GoogleController {
  constructor(
    private readonly googleService: GoogleService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Google OAuth Callback handler.
   */
  public handleCallback = async (req: Request, res: Response) => {
    try {
      const authInfo = req.user as unknown as {
        profile: any;
        accessToken: string;
        refreshToken?: string;
      };

      if (!authInfo || !authInfo.profile) {
        console.error(
          "[google.controller] Passport authentication info missing.",
        );
        return res.status(401).json({ error: "Authentication failed" });
      }

      const mapped = this.googleService.mapProfile(authInfo.profile);
      const userRepo = AppDataSource.getRepository(User);

      // Look up user by googleId, or fall back to finding by email for association
      let user = await userRepo.findOne({
        where: [{ googleId: mapped.googleId }, { email: mapped.email }],
      });

      const { nanoid } = await import("nanoid");

      // Encrypt the refresh token if Google returned one
      let encryptedRefreshToken: string | null = null;
      if (authInfo.refreshToken) {
        encryptedRefreshToken = this.googleService.encryptToken(
          authInfo.refreshToken,
        );
      }

      if (!user) {
        // Create new user
        user = userRepo.create({
          id: nanoid(),
          email: mapped.email,
          name: mapped.name,
          googleId: mapped.googleId,
          provider: mapped.provider,
          providerId: mapped.providerId,
          avatar: mapped.avatar,
          image: mapped.avatar, // keep existing image field aligned
          emailVerified: new Date(),
          refreshToken: encryptedRefreshToken,
        });
        await userRepo.save(user);
        console.log(`[google.controller] Created new user: ${user.email}`);
      } else {
        // Update existing user details
        user.googleId = mapped.googleId;
        user.provider = mapped.provider;
        user.providerId = mapped.providerId;
        user.avatar = mapped.avatar;
        user.image = mapped.avatar; // keep existing image field aligned
        user.emailVerified = user.emailVerified || new Date();

        // Update refresh token ONLY if Google provided a new one
        if (encryptedRefreshToken) {
          user.refreshToken = encryptedRefreshToken;
        }

        await userRepo.save(user);
        console.log(`[google.controller] Updated existing user: ${user.email}`);
      }

      // Generate application-level JWT
      const appToken = this.jwtService.generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
      });

      // Set cookie (matching core/api/auth.ts)
      res.cookie("token", appToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // Redirect frontend to dashboard
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const dashboardUrl = `${frontendUrl}/dashboard`;
      return res.redirect(dashboardUrl);
    } catch (err) {
      console.error("[google.controller] Callback handler error:", err);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      return res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }
  };
}
