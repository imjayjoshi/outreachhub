import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

export class GoogleOAuthStrategy {
  /**
   * Configures the Passport Google Strategy.
   */
  public configure(): void {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackURL = process.env.GOOGLE_CALLBACK_URL;

    if (!clientID || !clientSecret || !callbackURL) {
      console.warn(
        "[passport] Google OAuth credentials are not fully configured in environment.",
      );
    }

    passport.use(
      new GoogleStrategy(
        {
          clientID: clientID || "dummy_client_id",
          clientSecret: clientSecret || "dummy_client_secret",
          callbackURL: callbackURL || "dummy_callback_url",
          passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
          try {
            // Return tokens and profile back to the route/controller layer.
            return done(null, {
              profile,
              accessToken,
              refreshToken,
            } as any);
          } catch (err) {
            return done(err as Error);
          }
        },
      ),
    );
  }
}
