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

## Recent Updates (January 2025)

### Push Notifications & Admin Dashboard
- **Enhanced Admin Dashboard**: Added comprehensive admin control panel with stats overview, user management, and notification sending capabilities
- **Push Notification System**: Implemented construction industry-themed notification templates ("Knock-off Deal's On", "Smoko Sorted", etc.) with scheduled delivery
- **User Analytics**: Added real-time statistics including active users today, total points earned/redeemed, and transaction tracking

### Automatic Point Updates (Moma Integration)
- **External Transaction Processing**: Built API endpoint `/api/external/transaction` to receive vending machine transaction data from Moma app
- **Automatic User Matching**: System matches transactions to users via card numbers (no QR scanning required)
- **Real-time Point Awards**: Points automatically credited based on purchase amount (10 points per dollar spent)
- **Admin Transaction Management**: Unprocessed transactions can be manually matched to users through admin dashboard

### Enhanced Database Schema
- **Notifications Table**: Stores push notifications with scheduling and read status
- **External Transactions Table**: Tracks vending machine purchases from external systems
- **User Enhancements**: Added card number linking, push token storage, and notification preferences
- **Transaction Enhancements**: Added external transaction ID linking and auto-generation flags

### Integration Capabilities
- **Webhook Endpoint**: `/api/external/transaction` accepts JSON transaction data from vending machine systems
- **Automatic Processing**: Transactions automatically trigger point awards, tier promotions, and achievement notifications
- **Manual Override**: Admin can manually match unprocessed transactions to users
- **Real-time Updates**: Dashboard refreshes every 30 seconds to show new transactions

The system now supports fully automated point updates without user interaction, making it seamless for customers to earn loyalty points from vending machine purchases.

### Alternative Integration Methods (No API Required)
- **CSV Import System**: Admins can export transaction data from Moma app and upload CSV files for automatic processing
- **QR Code Manual Entry**: Customers can scan QR codes at vending machines to manually add points for purchases
- **Redemption Code System**: Customers receive unique codes (e.g., HIVIS-ABC123-DEF4) when redeeming rewards that can be validated at vending machines
- **Admin Validation Tools**: Built-in redemption code validator for vending machine operators to verify and mark codes as used

### Enhanced Reward Redemption System
- **Unique Redemption Codes**: Each reward redemption generates a unique alphanumeric code
- **Modal Display**: Customers see redemption codes in a prominent modal with copy-to-clipboard functionality
- **Code Validation**: Admin dashboard includes tools to validate redemption codes and mark them as used
- **Customer Notifications**: Automatic notifications sent when rewards are redeemed with redemption instructions

### Developer Access Control (January 2025)
- **Restricted Developer Page**: Added exclusive developer console accessible only to accounts with `isDeveloper` flag
- **Email-Based Access**: Developer status automatically assigned to `byron@sydneyselectvending.com.au` during signup
- **Advanced System Controls**: Developer console includes database operations, user analytics, and system diagnostics
- **Security Separation**: Developer access is separate from admin access, providing higher-level system controls

### AWS Integration for Moma Data Transfer (January 2025)
- **S3 Bucket Monitoring**: Automatically processes transaction files uploaded by Moma app to AWS S3
- **SQS Real-time Sync**: Optional SQS queue integration for instant transaction notifications
- **Automated Processing**: Converts AWS data to Hi-Vis transactions and awards points automatically
- **Admin Controls**: Full AWS sync management through admin dashboard (start/stop/test connections)
- **Dual Data Sources**: Supports both batch file processing and real-time message queues
- **Comprehensive Setup**: Complete AWS configuration guide with IAM, S3, and SQS setup instructions

The system now provides four complete integration methods:
1. **AWS S3/SQS Integration**: Automatic sync with cloud services (recommended for scale)
2. **CSV Import**: Manual upload of exported transaction data
3. **QR Code Scanning**: Customer-initiated point collection
4. **API Webhook**: Direct HTTP endpoint for real-time integration

### Product-Specific Point System (February 2025)
- **Smart Point Allocation**: AWS transactions automatically assign different point values based on product type
- **Large Drinks**: 20 points per purchase (600ml, 750ml, or "large" in product name)
- **Small Drinks**: 10 points per purchase (250ml, 330ml, cans, bottles, water, soft drinks)
- **Snacks**: 15 points per purchase (chips, chocolate, bars, biscuits, nuts, crackers)
- **Fallback System**: 10 points for unrecognized products
- **Automated Processing**: Point calculation happens automatically during AWS sync without user intervention

### Monthly Season Leaderboard System (February 2025)
- **Monthly Competitions**: Leaderboard resets automatically each month with seasonal tracking
- **Season Management**: System creates new seasons automatically (e.g., "January 2025", "February 2025")
- **Suburb-Based Rankings**: Users compete within their suburb groups for monthly prizes
- **Monthly Prize Structure**: 
  - 1st Place: 3 Free Large Drinks
  - 2nd Place: 2 Free Large Drinks
  - 3rd Place: 1 Free Large Drink
- **Automatic Reset**: Points and rankings reset at month end, with historical season data preserved
- **Visual Integration**: Leaderboard tab displays current month name and prize information prominently