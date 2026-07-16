import passport from "passport";
import { GoogleOAuthStrategy } from "../google/google.strategy.js";

export class PassportConfig {
  constructor(private readonly googleStrategy: GoogleOAuthStrategy) {}

  /**
   * Initializes strategies and returns passport instance.
   */
  public init() {
    this.googleStrategy.configure();
    return passport;
  }
}

// Export default singleton instance matching DI structure
const googleStrategy = new GoogleOAuthStrategy();
const passportConfig = new PassportConfig(googleStrategy);

export function initPassport() {
  return passportConfig.init();
}

export default passport;
