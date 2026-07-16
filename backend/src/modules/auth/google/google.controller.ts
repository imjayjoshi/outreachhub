import { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { ApiResponse } from "@/modules/shared/utils/apiResponse.js";
import { Logger } from "@/modules/shared/utils/logger.js";

export class GoogleController {
  constructor(private readonly authService: AuthService) {}

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
        Logger.error(
          "[google.controller] Google authentication info or profile is missing.",
        );
        return ApiResponse.failure(res, "Authentication failed", null, 401);
      }

      // Delegate business/DB logic to AuthService
      const { user, token } = await this.authService.handleGoogleCallback(
        authInfo.profile,
        authInfo.accessToken,
        authInfo.refreshToken,
      );

      // Set cookie (matching core/api/auth.ts)
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      Logger.info(
        `[google.controller] Google login successful for user: ${user.email}`,
      );

      // Redirect frontend to dashboard
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const dashboardUrl = `${frontendUrl}/dashboard`;
      return res.redirect(dashboardUrl);
    } catch (err) {
      Logger.error("[google.controller] Callback handler error:", err);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      return res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }
  };
}
