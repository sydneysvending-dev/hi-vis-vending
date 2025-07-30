# Hi-Vis Vending - Loyalty App

## Overview

Hi-Vis Vending is a mobile-first loyalty application designed for construction site vending machines. The app allows workers to earn points through purchases, track their loyalty progress, and redeem rewards. The system features a tiered loyalty system (Apprentice → Tradie → Foreman) and includes administrative capabilities for machine management and user analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

This is a full-stack TypeScript application with a clear separation between client and server components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom Hi-Vis color scheme (orange/yellow theme)
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OAuth integration with session management
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple

## Key Components

### Authentication System
- **Provider**: Replit OAuth with OpenID Connect
- **Session Management**: Server-side sessions stored in PostgreSQL
- **Authorization**: Role-based access control (regular users vs admins)
- **Security**: HTTP-only cookies with secure flags for production

### Database Schema
The application uses four main database tables:

1. **Users Table**: Stores user profiles, loyalty tier, points, and punch card progress
2. **Transactions Table**: Records all point-earning and spending activities
3. **Rewards Table**: Catalog of available rewards with point costs
4. **Machines Table**: Vending machine inventory and status tracking
5. **Sessions Table**: Server-side session storage for authentication

### Loyalty System
- **Tiers**: Three-tier system (Apprentice: 0-499 pts, Tradie: 500-999 pts, Foreman: 1000+ pts)
- **Point Earning**: 10 points per purchase from vending machines
- **Punch Card**: Digital punch card system (10 punches = free large drink)
- **Rewards**: Point-based redemption system for drinks and snacks

### QR Code Integration
- **Scanner**: Mobile-optimized QR code scanner for machine interaction
- **Machine Identification**: QR codes encode machine IDs for purchase tracking
- **Purchase Flow**: Scan → Purchase → Points Awarded → Transaction Recorded

## Data Flow

1. **User Authentication**: Replit OAuth → Session Creation → User Profile Lookup/Creation
2. **Purchase Flow**: QR Scan → Machine Validation → Points Award → Database Update
3. **Reward Redemption**: Point Check → Deduction → Transaction Recording
4. **Admin Operations**: Machine Status Updates → User Analytics → System Monitoring

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection (serverless-optimized)
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **@tanstack/react-query**: Server state management and caching
- **openid-client**: OAuth/OpenID Connect implementation
- **express-session**: Session management middleware

### UI Dependencies
- **@radix-ui/***: Accessible UI primitive components
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Feather icon set for React
- **class-variance-authority**: Component variant management

### Development Dependencies
- **vite**: Frontend build tool and dev server
- **typescript**: Type safety across the entire stack
- **tsx**: TypeScript execution for Node.js

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: Node.js with tsx for TypeScript execution
- **Database**: Neon PostgreSQL (serverless)
- **Authentication**: Replit OAuth (development mode)

### Production Build
- **Frontend**: Static build output to `dist/public`
- **Backend**: ESBuild bundle to `dist/index.js`
- **Serving**: Express serves both API routes and static frontend
- **Database**: Neon PostgreSQL with connection pooling

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **SESSION_SECRET**: Session encryption key (required)
- **REPL_ID**: Replit application identifier (required for OAuth)
- **ISSUER_URL**: OAuth provider URL (defaults to Replit)

The application is optimized for deployment on Replit but can be adapted for other platforms by modifying the authentication strategy and environment configuration.