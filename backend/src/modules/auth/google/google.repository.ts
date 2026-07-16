import { AppDataSource } from "@/modules/shared/database/dataSource.js";
import { User } from "@/modules/shared/database/entities/user.entity.js";
import { Repository } from "typeorm";

export class GoogleRepository {
  private get repo(): Repository<User> {
    return AppDataSource.getRepository(User);
  }

  /**
   * Find user by email address.
   */
  public async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  /**
   * Find user by Google ID.
   */
  public async findByGoogleId(googleId: string): Promise<User | null> {
    return this.repo.findOne({ where: { googleId } });
  }

  /**
   * Create a new user.
   */
  public async create(user: Partial<User>): Promise<User> {
    const newUser = this.repo.create(user);
    return this.repo.save(newUser);
  }

  /**
   * Save changes to user.
   */
  public async save(user: User): Promise<User> {
    return this.repo.save(user);
  }

  /**
   * Update refresh token.
   */
  public async updateRefreshToken(
    userId: string,
    encryptedToken: string | null,
  ): Promise<void> {
    await this.repo.update(userId, { refreshToken: encryptedToken });
  }

  /**
   * Update avatar.
   */
  public async updateAvatar(
    userId: string,
    avatarUrl: string | null,
  ): Promise<void> {
    await this.repo.update(userId, { avatar: avatarUrl, image: avatarUrl });
  }

  /**
   * Update last login.
   */
  public async updateLastLogin(userId: string, lastLogin: Date): Promise<void> {
    await this.repo.update(userId, { lastLogin });
  }
}
