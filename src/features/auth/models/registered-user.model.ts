import type { AuthSession } from "./auth-session.model";
import type { User } from "./user.model";

export interface RegisteredUser {
  session: AuthSession;
  user: User;
}
