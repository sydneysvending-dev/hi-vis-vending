# Moma App Integration Guide for Hi-Vis Vending

This guide explains how to automatically scrape and sync transaction data from your Moma vending machine app to the Hi-Vis loyalty system.

## 🎯 Overview

The Hi-Vis loyalty app can automatically process transactions from your Moma vending machines in three ways:

1. **Real-time Webhooks** (Recommended) - Instant transaction processing
2. **API Polling** - Automatic periodic data fetching  
3. **Manual Import** - CSV upload and manual matching

## 🔄 Method 1: Real-time Webhooks (Recommended)

### Setup Steps:

1. **Configure Webhook in Moma App:**
   - Login to your Moma admin dashboard
   - Navigate to Settings > Webhooks/Integrations
   - Add webhook URL: `https://your-replit-domain/api/moma/webhook`
   - Set trigger: "Transaction Completed"

2. **Webhook Payload Format:**
```json
{
  "transaction": {
    "id": "MOMA_TX_12345",
    "machine_id": "HIVIS_MACHINE_001",
    "card_number": "4532123456789012",
    "amount_cents": 350,
    "product_name": "Coca Cola 600ml",
    "timestamp": "2025-01-30T06:15:30Z",
    "location": "Construction Site A",
    "payment_method": "credit_card"
  }
}
```

3. **Benefits:**
   - Instant point awards (no delay)
   - Real-time notifications to customers
   - Automatic tier upgrades
   - No manual intervention needed

## 🔁 Method 2: API Polling (Auto-sync)

### Setup Steps:

1. **Get Moma API Credentials:**
   - Contact your Moma account manager for API access
   - Obtain API key and endpoint URL

2. **Configure Environment Variables:**
   ```bash
   MOMA_API_KEY=your_moma_api_key_here
   MOMA_API_URL=https://api.moma.app
   ```

3. **Start Auto-sync:**
   - Login to Hi-Vis admin dashboard
   - Go to "Moma Sync" tab
   - Click "Test Connection" to verify
   - Click "Start Auto-Sync"

4. **How it Works:**
   - Checks Moma API every 30 seconds
   - Fetches new transactions since last sync
   - Automatically matches to Hi-Vis users
   - Awards points and sends notifications

## 📋 Method 3: Manual Import

### Setup Steps:

1. **Export from Moma:**
   - Generate transaction report (CSV format)
   - Include: transaction_id, machine_id, card_number, amount, product, timestamp

2. **Process in Hi-Vis:**
   - Use the external transaction demo script
   - Manually match unprocessed transactions in admin dashboard

## 🎯 Automatic Matching System

### Matching Priority:
1. **Card Number** (Primary) - Most reliable method
2. **Phone Number** (Backup) - Alternative matching
3. **Manual Matching** (Fallback) - Admin intervention required

### Point Award Logic:
- **10 points per dollar spent** (e.g., $3.50 purchase = 35 points)
- **Punch card progress** (+1 punch per purchase)
- **Tier upgrades** (Apprentice → Tradie → Foreman)
- **Bonus rewards** (10 punches = 100 bonus points + free drink)

## 🚀 Testing Your Integration

### Using the Demo Script:
```bash
node demo-external-transaction.js
```

This script simulates Moma transactions and shows how the integration works.

### Verify Integration:
1. Send test transaction from Moma
2. Check Hi-Vis admin dashboard for new transactions
3. Verify points were awarded correctly
4. Confirm user received notification

## 🔧 Troubleshooting

### Common Issues:

**Webhook Not Receiving Data:**
- Check webhook URL is correct
- Verify Moma webhook is enabled
- Check server logs for errors

**API Polling Not Working:**
- Verify MOMA_API_KEY is correct
- Test connection in admin dashboard
- Check API rate limits

**Transactions Not Matching:**
- Ensure customers have linked card numbers
- Check card number format consistency
- Use manual matching for unprocessed transactions

**Points Not Awarded:**
- Check transaction amount is in cents
- Verify user exists in system
- Check server logs for processing errors

## 📊 Monitoring & Analytics

### Admin Dashboard Features:
- **Real-time Stats** - Users, transactions, points
- **Transaction History** - All processed transactions
- **Unprocessed Queue** - Transactions waiting for matching
- **Sync Status** - Connection and polling status

### Notification System:
- **Points Earned** - "You earned 35 points from your Coca Cola purchase!"
- **Tier Upgrades** - "Congratulations! You've been promoted to Tradie tier!"
- **Punch Card** - "Punch card completed - Free large drink!"

## 🔐 Security Considerations

### API Security:
- Use HTTPS for all webhook endpoints
- Validate webhook signatures (if Moma provides)
- Store API keys securely in environment variables
- Rate limit webhook endpoints

### Data Privacy:
- Only store necessary transaction data
- Hash/encrypt sensitive card information
- Comply with PCI DSS requirements
- Regular security audits

## 🆘 Support

### Getting Help:
1. Check server logs for error messages
2. Use admin dashboard diagnostics
3. Test with demo script first
4. Contact Moma support for API issues

### Integration Success Metrics:
- **Automatic Match Rate** - Target: >90% of transactions
- **Processing Speed** - Target: <5 seconds from purchase to points
- **Customer Satisfaction** - Instant gratification with point awards
- **Admin Efficiency** - Minimal manual intervention required

---

**Pro Tip:** Start with Method 3 (manual import) to test the system, then implement Method 1 (webhooks) for full automation once everything is working correctly.