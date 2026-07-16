import { Router } from "express";
import passport from "passport";
import { GoogleController } from "./google.controller.js";
import { GoogleService } from "./google.service.js";
import { JwtService } from "./jwt.service.js";

export class GoogleRoutes {
  public readonly router: Router;

  constructor(private readonly googleController: GoogleController) {
    this.router = Router();
    this.setupRoutes();
  }

  /**
   * Register Google OAuth routes.
   */
  private setupRoutes() {
    // GET /api/auth/google
    this.router.get(
      "/",
      passport.authenticate("google", {
        scope: [
          "openid",
          "profile",
          "email",
          "https://www.googleapis.com/auth/gmail.send",
        ],
        accessType: "offline",
        prompt: "consent",
        session: false,
      }),
    );

    // GET /api/auth/google/callback
    this.router.get(
      "/callback",
      passport.authenticate("google", {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=unauthorized`,
      }),
      this.googleController.handleCallback,
    );
  }
}

// Instantiate singleton with Dependency Injection
const googleService = new GoogleService();
const jwtService = new JwtService();
const googleController = new GoogleController(googleService, jwtService);
const googleRoutesInstance = new GoogleRoutes(googleController);

export default googleRoutesInstance.router;
