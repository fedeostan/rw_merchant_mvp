# RW Merchant MVP

A Next.js merchant dashboard application with Supabase backend integration for managing cryptocurrency transactions, API keys, and payment modules.

## Features

- **Dashboard**: Real-time wallet balance with MNEE and crypto holdings
- **Transactions**: View and filter transaction history
- **Merchant Tools**:
  - Module management (payment integrations)
  - API key generation and management
  - API documentation and examples
  - Theming and customization

## Tech Stack

- **Frontend**: Next.js 16 with React 19 and TypeScript
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **API Generation**: Orval (OpenAPI code generation)

## Prerequisites

- Node.js 18+
- pnpm 10+
- Supabase CLI
- CoinGecko API key (for crypto price data)

## Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/fedeostan/rw_merchant_mvp.git
cd rw_merchant_mvp
pnpm install
```

### 2. Environment Setup

Copy the example environment file and configure:

```bash
cp .env.example .env.local
```

Required environment variables:

```bash
# Supabase Configuration
# Get from: https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
NEXT_PUBLIC_API_BASE_URL=/api

# CoinGecko API (for crypto prices)
# Sign up at: https://www.coingecko.com/en/api/pricing
# Rate limits: 30 calls/min, 10,000 calls/month
COINGECKO_API_KEY=your_coingecko_api_key
```

### 3. Database Setup

#### Start Local Supabase

```bash
supabase start
```

This will start a local Supabase instance and output connection details.

#### Apply Migrations

```bash
supabase db push
```

Or apply migrations manually:

```bash
supabase migration up
```

### 4. Seed Test Data

The migrations include seed data for:
- Test API keys
- Cryptocurrency prices (BTC, ETH, MNEE, etc.)

For additional test data, see `supabase/migrations/` directory.

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
rw_merchant_mvp/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/               # API route handlers
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── login/            # Authentication pages
│   │   └── signup/
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui base components
│   │   └── ...               # Feature components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities and configurations
│   │   ├── api/              # API client (Orval generated)
│   │   ├── supabase/         # Supabase client setup
│   │   └── query/            # TanStack Query client
│   └── types/                 # TypeScript type definitions
├── supabase/
│   └── migrations/            # Database migrations
├── openapi/
│   └── schema.yaml           # OpenAPI specification
└── docs/                      # Additional documentation
```

## Available Scripts

```bash
# Development
pnpm dev           # Start development server

# Build
pnpm build         # Build production bundle

# Code Quality
pnpm lint          # Run ESLint
pnpm format        # Format with Prettier

# API Generation
pnpm generate:api  # Generate API client from OpenAPI spec
```

## Database Schema

The application uses Supabase with the following main tables:

- **organizations**: Merchant organizations
- **user_organizations**: User-org membership with roles
- **modules**: Payment integration modules
- **transactions**: Transaction records
- **apikeys**: API key storage with secure hashing
- **crypto_prices**: Cryptocurrency price data

All tables have Row Level Security (RLS) policies for secure multi-tenant access.

## Authentication

The app uses Supabase Auth with:
- Email/password authentication
- OTP (One-Time Password) verification
- JWT-based session management
- Organization-based access control

## API Endpoints

All API routes are in `src/app/api/`:

- `GET /api/orgs/[orgId]/balance` - Get wallet balance
- `GET/POST /api/orgs/[orgId]/transactions` - Manage transactions
- `GET/POST /api/orgs/[orgId]/modules` - Manage modules
- `GET/POST /api/orgs/[orgId]/apikeys` - Manage API keys
- `GET /api/crypto/prices` - Get cryptocurrency prices
- `POST /api/wallet/*` - Wallet operations (buy, sell, send, receive)

See [API Documentation](docs/api-documentation.md) for detailed endpoint reference.

## Documentation

- [Supabase Architecture](docs/supabase-architecture.md) - Database schema and RLS policies
- [API Documentation](docs/api-documentation.md) - Complete API reference
- [Development Guide](docs/development-guide.md) - Local setup and workflow
- [Migration History](docs/msw-to-supabase-migration.md) - MSW to Supabase migration story

## Deployment

### Production Build

```bash
pnpm build
pnpm start
```

### Vercel Deployment

The app is optimized for Vercel deployment:

1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy

Vercel will automatically:
- Build the Next.js application
- Configure edge functions
- Set up CDN and caching

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run `pnpm lint` and `pnpm format`
4. Ensure `pnpm build` passes
5. Submit a pull request

## License

MIT

## Related Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query)
- [shadcn/ui](https://ui.shadcn.com)
- [Orval](https://orval.dev)
