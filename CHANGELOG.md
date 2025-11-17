# Changelog

All notable changes to the RW Merchant MVP project.

## [Unreleased]

### Added
- Comprehensive project documentation
  - README.md with complete setup instructions
  - Supabase architecture documentation
  - API documentation with all endpoints
  - Development guide for new contributors
  - MSW to Supabase migration history

### Removed
- MSW (Mock Service Worker) infrastructure
  - Deleted `src/lib/msw/` directory
  - Removed MSW package dependency (~2MB bundle reduction)
  - Simplified providers.tsx (no MSW initialization)
  - Cleaned up environment variables

### Changed
- Simplified application providers
- Updated .gitignore and .env.example
- Updated migrations README with current migration list

---

## [0.5.0] - 2025-01-15 - Epic 5: MSW Cleanup & Documentation

### Summary
Final cleanup phase removing all MSW infrastructure and creating comprehensive documentation.

### Added
- Complete project documentation suite
- CHANGELOG.md for version tracking

### Removed
- All MSW files (handlers.ts, seed.ts, browser.ts)
- MSW package from dependencies
- mockServiceWorker.js from public folder
- MSW-related environment variables

### Changed
- Simplified Providers component (11 lines from 56)
- Cleaned up configuration files

---

## [0.4.0] - 2025-01-14 - Epic 3: Crypto Price System

### Summary
Implemented smart cryptocurrency price refresh system with CoinGecko integration.

### Added
- `crypto_prices` database table
- `crypto_prices_latest` database view
- CoinGecko API integration (30 req/min rate limit)
- MNEE stablecoin price storage (pegged at $1.00)
- Smart price caching with 5-minute TTL
- Enhanced balance hook with optimistic updates
- Crypto price seeding for development

### Changed
- Balance calculation now includes crypto holdings
- Wallet actions use real-time price data
- Dashboard displays accurate crypto values

### Removed
- Legacy useMneePrice hook
- Old price endpoint mock handler

---

## [0.3.0] - 2025-01-14 - Epic 2: API Key Management

### Summary
Secure API key generation and management system.

### Added
- `apikeys` database table with RLS
- Bcrypt hashing for secure key storage
- API key generation endpoint
- Key revocation functionality
- Test API key seeding
- Last 4 characters display for identification

### Security
- Keys never stored in plaintext
- Full key shown only once at creation
- Role-based access (admin/owner only)
- Usage tracking (last_used_at)

---

## [0.2.0] - 2025-01-12 - Epic 1: Transactions & Balance

### Summary
Core transaction system with balance calculation.

### Added
- `transactions` database table
- Comprehensive transaction schema:
  - Type: in/out
  - Method: stablecoin/payout/adjustment
  - Display type: receive/send/buy/sell/swap
  - Status: pending/posted/failed
- Transaction API endpoints (GET/POST)
- Balance calculation from posted transactions
- RLS policies for multi-tenant security
- Transaction indexes for performance

### Changed
- Removed storefront concept (simplified data model)
- Balance now computed from real transaction data

---

## [0.1.0] - 2025-01-11 - Foundation: Supabase Integration

### Summary
Initial migration from MSW to Supabase backend.

### Added
- Supabase project configuration
- Authentication with email OTP
- `organizations` table
- `user_organizations` table (membership with roles)
- `modules` table for payment integrations
- RLS policies for all tables
- Supabase client setup (server and client)
- Auth hooks (useAuth, useOrg)
- Organization search endpoint

### Changed
- Authentication flow to use Supabase Auth
- API routes to query Supabase instead of MSW
- Data persistence (no longer lost on refresh)

### Security
- Row Level Security (RLS) enabled on all tables
- Role-based permissions (owner/admin/member)
- JWT token-based authentication

---

## [0.0.1] - Initial Release - MSW-based MVP

### Summary
Initial merchant dashboard with MSW (client-side mocking).

### Features
- Dashboard with wallet balance display
- Transaction listing (mock data)
- Module management UI
- Authentication UI (mock only)
- Merchant tools documentation
- API documentation examples

### Technical
- Next.js 16 with App Router
- React 19 with TypeScript
- Tailwind CSS 4 with shadcn/ui
- TanStack Query for state management
- MSW for client-side API mocking
- Orval for OpenAPI code generation

### Limitations
- No data persistence
- No real authentication
- No multi-tenant security
- Large bundle size (MSW ~2MB)

---

## Migration History

The project underwent a significant architectural migration:

1. **v0.0.1**: MSW-based mocking (client-side only)
2. **v0.1.0**: Supabase integration (real database)
3. **v0.2.0**: Transaction system (core feature)
4. **v0.3.0**: API key management (security feature)
5. **v0.4.0**: Crypto price system (price data)
6. **v0.5.0**: MSW cleanup (final cleanup)

This migration path transformed a prototype into a production-ready application.

---

## Version Format

This project uses semantic versioning (SemVer):
- **MAJOR.MINOR.PATCH**
- MAJOR: Breaking changes
- MINOR: New features (backwards compatible)
- PATCH: Bug fixes (backwards compatible)

Epic completion triggers MINOR version bumps as they represent significant feature additions.

---

## Related Links

- [GitHub Repository](https://github.com/fedeostan/rw_merchant_mvp)
- [Issue #10: Initial Migration](https://github.com/fedeostan/rw_merchant_mvp/issues/10)
- [Issue #15: Epic 5 - MSW Cleanup](https://github.com/fedeostan/rw_merchant_mvp/issues/15)
- [Project Documentation](./docs/)
