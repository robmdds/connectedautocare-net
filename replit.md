# TPA Insurance Management Platform

## Overview

This is a comprehensive Third Party Administrator (TPA) insurance management platform built with modern web technologies. The system provides end-to-end insurance operations management including policy administration, claims processing, payment handling, rating engines, and analytics. It's designed as a multi-tenant platform supporting various insurance products (auto, RV, marine, powersports, home) with direct-to-consumer and reseller portals.

The platform integrates with external services for VIN decoding, payment processing (Helcim), document generation, and provides an AI assistant for customer support and operational guidance.

## Recent Changes

**August 11, 2025** - Quote Generation & Coverage Display Complete
- ✅ Connected Auto Care VSC quote generation fully operational ($1,894.46 verified premium)
- ✅ Fixed vehicle class validation (now properly sends "Class A" instead of "A")
- ✅ Implemented dynamic term/mileage eligibility based on vehicle age and current mileage
- ✅ Added comprehensive coverage level display with three tiers (Elevate Platinum, Gold, Pinnacle Silver)
- ✅ Detailed information modals for each coverage level with complete feature lists
- ✅ Professional coverage comparison layout with pricing, descriptions, and detailed specs
- ✅ Vehicle eligibility rules: 15-year age limit, 150,000 mile maximum, excluded make/model filtering
- ✅ Term restrictions based on vehicle age (older vehicles get shorter available terms)
- ✅ Coverage miles filtering based on projected mileage to prevent over-coverage
- ✅ VIN decoding service operational (240ms response time)
- ✅ Rate calculation engine working with authentic Connected Auto Care rate tables
- ✅ Multi-tenant architecture operational with proper data validation
- ⚠️ Authentication requires REPLIT_DOMAINS environment variable for full testing
- ⚠️ Payment integration pending Helcim API key configuration

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite for build tooling
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **File Uploads**: Uppy integration for document and file management

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth integration with session-based authentication
- **API Design**: RESTful API with dedicated service layer architecture
- **File Storage**: Google Cloud Storage integration for document management

### Database Design
- **Multi-tenant architecture** with tenant isolation
- **Core entities**: Users, Tenants, Products, Policies, Claims, Payments, Vehicles, Documents
- **Analytics events** tracking for business intelligence
- **Rate tables** for pricing calculations with version control
- **Audit trails** for claims processing and policy changes

### Payment Processing
- **Primary Provider**: Helcim payment gateway integration
- **Webhook handling** for real-time payment status updates
- **Automatic policy issuance** upon successful payment verification
- **PCI compliance** through tokenized payment flows

### Rating Engine
- **Spreadsheet-based rate tables** with CSV/XLSX import capabilities
- **Multi-factor rating** including vehicle age, mileage, location, coverage options
- **External API adapters** for third-party rating services
- **Tax calculation** based on purchaser location
- **Dynamic pricing** with promotional codes and reseller markups

### Claims Management
- **FNOL (First Notice of Loss)** workflow automation
- **Adjuster assignment** and workload management
- **AI-powered claims analysis** for fraud detection and processing assistance
- **Audit trail** for all claim actions and decisions
- **Document management** for claim-related files

### AI Assistant
- **Knowledge base** integration with RAG (Retrieval Augmented Generation)
- **Customer support** for policy and claims inquiries  
- **Operational assistance** for staff workflows
- **Grounded responses** using verified insurance disclosures and FAQ content

## External Dependencies

### Database Services
- **PostgreSQL**: Primary database hosted on Neon (serverless PostgreSQL)
- **Drizzle ORM**: Type-safe database operations and migrations

### Authentication & Security
- **Replit Auth**: OAuth-based authentication system
- **Session management**: PostgreSQL-backed session store

### Payment Processing
- **Helcim API**: Primary payment processor for card transactions
- **Webhook verification**: Cryptographic signature validation for payment events

### File Storage & CDN
- **Google Cloud Storage**: Document and file storage
- **Uppy**: File upload and management interface

### External APIs
- **ChromeData API**: Vehicle identification and valuation
- **NHTSA API**: Fallback VIN decoding service
- **OpenAI API**: AI assistant and natural language processing

### Development & Deployment
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Backend bundling for production deployment
- **Replit**: Hosting platform with integrated development environment

### Monitoring & Analytics
- **Custom analytics service**: Business intelligence and KPI tracking
- **PostHog**: Optional user behavior analytics
- **Error handling**: Comprehensive error logging and user feedback systems