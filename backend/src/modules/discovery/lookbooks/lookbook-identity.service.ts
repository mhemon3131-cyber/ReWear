import { Injectable, UnauthorizedException } from '@nestjs/common';

// Member 2 - Feature 10: who owns a lookbook.
//
// ReWear's existing AuthModule issues a fixed mock token and does not identify users, and
// this module deliberately does NOT modify or reinterpret it. Until real authentication
// exists, lookbooks are only available through an explicitly enabled DEMO identity:
//
//   M2_DEMO_IDENTITY=true          enable the fixed demo identity (local demos only)
//   M2_DEMO_USER_ID=demo_buyer_m2  optional; the single owner used for every request
//
// DEMO IDENTITY IS NOT SECURE: anyone who can reach the backend acts as this one user.
// It provides no per-user accounts and must never be enabled on a shared deployment.

const VALID_ID = /^[A-Za-z0-9_.@-]{1,100}$/;
export const DEMO_WARNING =
  'Demo identity: every request acts as one fixed user. This is not a secure per-user account.';

@Injectable()
export class LookbookIdentityService {
  private readonly enabled: boolean;
  private readonly userId: string | null;
  private readonly problem: string | null;

  constructor() {
    const flag = (process.env.M2_DEMO_IDENTITY || '').trim().toLowerCase() === 'true';
    const id = (process.env.M2_DEMO_USER_ID || 'demo_buyer_m2').trim();
    this.problem = flag && !VALID_ID.test(id) ? 'M2_DEMO_USER_ID must be 1-100 characters of A-Z, 0-9, _ . @ -' : null;
    this.enabled = flag && !this.problem;
    this.userId = this.enabled ? id : null;
  }

  describe() {
    return {
      mode: this.enabled ? ('demo' as const) : ('disabled' as const),
      userId: this.userId,
      secure: false,
      message: this.enabled
        ? DEMO_WARNING
        : this.problem ||
          'Lookbooks need a signed-in user, but ReWear does not yet have real authentication. ' +
            'For a local demo only, set M2_DEMO_IDENTITY=true on the backend.',
    };
  }

  /** Owner for the current request, or 401 when no identity is available. */
  resolveOwner(): string {
    if (!this.enabled || !this.userId) throw new UnauthorizedException(this.describe().message);
    return this.userId;
  }
}
