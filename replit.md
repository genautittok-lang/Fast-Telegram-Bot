# DARKSHARE v4.0

## Overview

DARKSHARE is a Telegram bot application for risk assessment and security analysis. The platform enables users to analyze various data types including blockchain wallets, IP addresses, email addresses, phone numbers, domains, and social profiles for potential risks. The system provides risk scoring, generates PDF reports, and offers real-time monitoring capabilities.

The application consists of:
- A React-based landing page showcasing features and live statistics
- A Telegram bot (built with Telegraf) handling user interactions and analysis workflows
- A PostgreSQL database for user management, reports, monitoring watches, and payments

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom dark theme, CSS variables for theming
- **UI Components**: shadcn/ui component library (Radix UI primitives)
- **Animations**: Framer Motion for terminal-style effects and transitions
- **Fonts**: JetBrains Mono (code), Inter (body), Space Grotesk (display)
- **Build Tool**: Vite with path aliases (@/, @shared/, @assets/)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ES modules)
- **Bot Framework**: Telegraf for Telegram bot interactions
- **PDF Generation**: PDFKit for generating analysis reports
- **API Design**: RESTful endpoints defined in shared/routes.ts with Zod validation

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: shared/schema.ts
- **Key Tables**:
  - `users`: User profiles, subscription tiers, request quotas, referral codes
  - `reports`: Generated analysis reports with PDF paths
  - `watches`: Active monitoring configurations with alert thresholds
  - `payments`: Payment records for subscriptions
  - `referrals`: Referral tracking between users

### Code Organization
- `client/` - React frontend application
- `server/` - Express backend and Telegram bot
- `shared/` - Shared types, schemas, and route definitions
- `migrations/` - Drizzle database migrations

### Key Design Patterns
- **Storage Interface**: `IStorage` abstraction allows for different storage implementations
- **Shared Schemas**: Drizzle schemas generate both database types and Zod validation
- **Type-Safe Routes**: API routes defined with Zod schemas for request/response validation
- **Bot State Management**: In-memory Map for tracking user conversation states

## External Dependencies

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `TELEGRAM_BOT_TOKEN`: Telegram Bot API token (optional - bot won't start without it)

### Third-Party Services
- **Telegram Bot API**: Primary user interface via Telegraf
- **PostgreSQL**: Database (use Replit's PostgreSQL or provision externally)

### Key NPM Packages
- `telegraf`: Telegram bot framework
- `drizzle-orm` + `drizzle-kit`: Database ORM and migrations
- `pdfkit`: PDF report generation
- `@tanstack/react-query`: Frontend data fetching
- `framer-motion`: UI animations
- `zod`: Runtime type validation

### Database Commands
- `npm run db:push`: Push schema changes to database