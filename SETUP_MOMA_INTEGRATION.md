# Moma Integration Setup Instructions

## Current Status
Your Hi-Vis loyalty app is ready for Moma integration, but the Moma API credentials need to be configured.

## Step 1: Get Your Moma API Credentials

Contact your Moma account representative to obtain:
- **API Key**: Your authentication token for accessing Moma's API
- **API URL**: The base URL for your Moma API endpoints
- **Webhook Access**: Permission to receive real-time transaction data

## Step 2: Configure Environment Variables

Add these to your Replit environment secrets:

```
MOMA_API_KEY=your_actual_moma_api_key_here
MOMA_API_URL=https://your-actual-moma-api-url.com
```

## Step 3: Integration Methods Available

### Method 1: Real-time Webhooks (Recommended)
- **Endpoint**: `https://your-replit-domain/api/moma/webhook`
- **Trigger**: Transaction completed events
- **Processing**: Instant point awards and notifications

### Method 2: Automatic Polling
- **Frequency**: Every 30 seconds
- **Endpoint**: Uses your MOMA_API_URL to fetch new transactions
- **Control**: Start/stop via admin dashboard

### Method 3: Manual Processing
- **Use Case**: Backup method or testing
- **Process**: Export CSV from Moma, use demo script or admin matching

## Step 4: Test Your Integration

1. Configure environment variables
2. Go to Admin Dashboard → Moma Sync tab
3. Click "Test Connection" to verify API access
4. Start automatic sync if connection works
5. Test with a vending machine purchase

## Current Demo Functionality

The system includes a demo script that simulates Moma transactions:
```bash
node demo-external-transaction.js
```

This shows how real transactions would be processed:
- Creates external transactions in database
- Awards points automatically when matched to users
- Sends notifications to customers
- Updates loyalty tiers and punch cards

## What Happens After Setup

Once configured, customers can:
1. Link their payment card in the Hi-Vis app
2. Make purchases from vending machines
3. Automatically receive loyalty points (10 points per dollar)
4. Get instant notifications about points earned
5. Enjoy automatic tier upgrades and rewards

## Need Help?

Contact your Moma representative for:
- API documentation specific to your setup
- Authentication credentials
- Webhook configuration assistance
- Testing support

The Hi-Vis system is fully ready - it just needs the connection details from Moma to start automatic transaction processing.