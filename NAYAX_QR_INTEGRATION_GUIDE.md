# Nayax DOT QR Code Integration Guide

## Overview

Your Hi-Vis Vending loyalty app now includes a complete QR code module that integrates with Nayax DOT vending machines. This enables customers to receive instant promotions, discounts, and bonus points by scanning personalized QR codes at vending machines.

## How It Works

### 1. Customer QR Code Generation
- Each customer gets a unique, time-stamped QR code tied to their account
- QR codes contain user ID, tier, current points, and security token
- Codes automatically update with user's current tier and points
- QR codes expire after 24 hours for security

### 2. Vending Machine Integration
- Customers select "Scan QR Code" on the Nayax DOT screen
- Machine scans the customer's phone displaying their Hi-Vis QR code
- System validates the code and returns applicable promotions
- Discounts and free items are applied automatically to the transaction

### 3. Real-time Promotion Delivery
- System determines promotions based on customer's loyalty tier
- Promotions are pushed to the Nayax DOT machine in real-time
- Bonus points are awarded immediately to customer's account
- Transaction is recorded for analytics and reporting

## Customer Benefits by Tier

### Apprentice (0-499 points)
- **Welcome Discount**: 10% off any purchase
- **Healthy Choice Bonus**: 25 extra points for healthy snacks
- **Basic QR benefits**: Standard promotions

### Tradie (500-999 points)
- **All Apprentice benefits PLUS:**
- **Power Hour**: Double points on energy drinks
- **Beverage Special**: 15% off all beverages
- **Enhanced QR benefits**: Better promotions and discounts

### Foreman (1000+ points)
- **All Tradie benefits PLUS:**
- **Premium Special**: Free large coffee with any purchase
- **Foreman Combo**: 20% off + 50 bonus points
- **Elite QR benefits**: Maximum promotions and exclusive offers

## Technical Implementation

### QR Code Data Format
```json
{
  "userId": "user-123",
  "timestamp": 1704067200000,
  "tier": "Tradie",
  "points": 750,
  "type": "hi-vis-customer",
  "token": "abc123def456"
}
```

### API Endpoints

#### QR Code Validation (for Nayax machines)
```http
POST /api/qr/validate
Content-Type: application/json

{
  "qrData": "JSON_STRING_FROM_QR_CODE",
  "machineId": "VEND-001"
}
```

**Response:**
```json
{
  "isValid": true,
  "user": { "id": "user-123", "firstName": "John", "currentTier": "Tradie" },
  "promotions": [
    {
      "id": "promo-1",
      "name": "Tradie Power Hour",
      "description": "Double points on energy drinks",
      "bonusPoints": 20,
      "type": "bonus_points"
    }
  ],
  "pointsBonus": 20,
  "discountPercentage": 15,
  "message": "Welcome John! 2 promotions available."
}
```

### Nayax DOT Integration

#### Step 1: Configure Nayax Machine
1. Enable QR code scanning in Nayax DOT settings
2. Set webhook URL: `https://your-domain/api/qr/validate`
3. Configure promotion delivery endpoints
4. Test connection with Hi-Vis backend

#### Step 2: Promotion Delivery
When a valid QR code is scanned:
1. Hi-Vis validates the customer and determines promotions
2. Promotion data is pushed to Nayax machine via API
3. Nayax applies discount/free items to transaction
4. Customer completes purchase with benefits applied
5. Bonus points are awarded to Hi-Vis account

#### Step 3: Transaction Recording
- QR scan is logged in Hi-Vis database
- Points are awarded based on promotion rules
- User's tier progression is updated automatically
- Analytics data is collected for reporting

## Security Features

### QR Code Security
- **Time Expiration**: Codes expire after 24 hours
- **Unique Tokens**: Random tokens prevent replay attacks
- **User Validation**: Each scan validates against active user account
- **Machine Verification**: Scans are tied to specific machine IDs

### API Security
- **Rate Limiting**: Prevents abuse of validation endpoint
- **Request Validation**: All QR data is validated before processing
- **Error Handling**: Failed scans are logged but don't expose user data
- **Audit Trail**: Complete history of all QR scans and promotions

## Customer Experience Flow

### 1. Generate QR Code
- Customer opens Hi-Vis app
- Navigates to "QR Scanner" page
- Personal QR code is displayed with current tier/points
- Code refreshes automatically or on demand

### 2. At the Vending Machine
- Customer approaches Nayax DOT vending machine
- Selects "Scan QR Code" option on screen
- Holds phone with QR code up to scanner
- Machine validates and applies promotions instantly

### 3. Complete Purchase
- Customer sees applied discounts/free items on screen
- Completes purchase using preferred payment method
- Receives instant notification of bonus points earned
- QR code promotions are automatically applied

### 4. Immediate Benefits
- Bonus points appear in Hi-Vis app within seconds
- Tier progression updates if thresholds are met
- Transaction history shows QR code benefits
- Push notifications confirm successful promotion redemption

## Analytics and Reporting

### QR Scan Metrics
- **Total QR scans** per day/week/month
- **Promotion redemption rates** by tier
- **Most popular promotions** and discounts
- **Peak usage times** at different machines

### Customer Insights
- **QR adoption rate** among loyalty members
- **Average promotion value** per customer tier
- **Frequency of QR usage** by individual customers
- **Impact on purchase behavior** and basket size

### Business Intelligence
- **Revenue impact** of QR promotions
- **Customer engagement** metrics
- **Operational efficiency** gains
- **ROI of promotional campaigns**

## Setup Requirements

### Hi-Vis App Configuration
- QR scanner page added to navigation
- Personal QR code generator implemented
- Promotion display and management
- Real-time point updates and notifications

### Nayax DOT Configuration
- QR code scanning capability enabled
- Webhook integration with Hi-Vis backend
- Promotion application system configured
- Error handling and fallback procedures

### Backend Integration
- QR validation API endpoint
- Nayax communication module
- Promotion rule engine
- Analytics and logging system

## Troubleshooting

### Common Issues

#### QR Code Not Scanning
- **Check QR code expiration**: Generate new code if older than 24 hours
- **Verify screen brightness**: Ensure phone screen is bright enough
- **Clean scanner lens**: Remove dust or debris from machine scanner
- **Try different angle**: Hold phone parallel to scanner surface

#### Promotions Not Applied
- **Confirm tier eligibility**: Check if promotion matches customer tier
- **Verify machine connectivity**: Ensure Nayax machine is online
- **Check promotion validity**: Confirm promotion is active and not expired
- **Review usage limits**: Check if customer has reached promotion usage limit

#### Points Not Awarded
- **Check internet connection**: Ensure Hi-Vis app has network access
- **Verify account status**: Confirm customer account is active
- **Review transaction logs**: Check admin dashboard for processing errors
- **Wait for sync**: Points may take up to 30 seconds to appear

### Support Process

1. **Customer Issues**: Direct to Hi-Vis app support within the app
2. **Machine Issues**: Contact Nayax technical support
3. **Integration Issues**: Check admin dashboard logs and error reports
4. **Promotion Issues**: Review promotion configuration in admin panel

## Future Enhancements

### Planned Features
- **Location-based promotions**: Different offers for different sites
- **Time-based promotions**: Happy hour discounts and special events
- **Group promotions**: Team-based rewards and competitions
- **Gamification**: Achievement badges and milestone rewards

### Advanced Integration
- **Biometric verification**: Enhanced security with fingerprint/face recognition
- **Multi-machine promotions**: Promotions that span multiple vending machines
- **Dynamic pricing**: Real-time price adjustments based on demand
- **Inventory integration**: Promotions based on stock levels

Your Hi-Vis Vending QR code system is now ready to deliver instant, personalized promotions to construction workers at vending machines across all your sites!