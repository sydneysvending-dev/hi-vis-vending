# Complete Moma AWS Integration Guide

## Overview

Your Hi-Vis Vending loyalty app now supports **complete AWS integration** with the Moma vending machine app. This provides automated, scalable data transfer without manual intervention.

## AWS Integration Methods

### Method 1: S3 Bucket Integration (Recommended)
- **What it does**: Monitors AWS S3 bucket for transaction files uploaded by Moma app
- **How it works**: Checks every 5 minutes for new JSON files, processes automatically
- **Best for**: Batch processing, reliable data transfer

### Method 2: SQS Queue Integration (Real-time)
- **What it does**: Receives instant notifications when transactions occur
- **How it works**: Processes messages in real-time as they arrive
- **Best for**: Immediate point awards, instant customer notifications

## Quick Setup Steps

### 1. AWS Account Setup
```bash
# Required environment variables
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
MOMA_S3_BUCKET=hi-vis-moma-data
MOMA_SQS_QUEUE=https://sqs.us-east-1.amazonaws.com/your-account/hi-vis-notifications
```

### 2. Configure Moma App Export
Set your Moma app to export transaction data to:
- **S3 Bucket**: `hi-vis-moma-data`
- **Folder**: `transactions/`
- **Format**: JSON files
- **Schedule**: Every 15 minutes (or real-time via SQS)

### 3. Expected Data Format
```json
{
  "transactionId": "TXN-20250101-001",
  "date": "2025-01-01T14:30:00Z",
  "amount": 350,
  "cardNumber": "1234",
  "product": "Large Coffee",
  "machineId": "VEND-001"
}
```

## Admin Dashboard Controls

### AWS Integration Tab
1. **Start AWS Sync**: Begins monitoring S3 and SQS
2. **Stop AWS Sync**: Pauses all AWS monitoring
3. **Test Connection**: Verifies AWS credentials and access
4. **Status Display**: Shows current sync state and last update

### How to Use
1. Navigate to Admin Dashboard → AWS Integration tab
2. Click "Test Connection" to verify AWS setup
3. Click "Start AWS Sync" to begin automatic processing
4. Monitor status and check for new transactions

## Automatic Processing

### What Happens Automatically
1. **File Detection**: System finds new transaction files in S3
2. **Data Processing**: Converts Moma format to Hi-Vis transactions
3. **User Matching**: Links transactions to users via card numbers
4. **Point Awards**: Automatically gives 10 points per dollar spent
5. **Notifications**: Sends push notifications for achievements

### Customer Benefits
- **Seamless Experience**: Points awarded without customer action
- **Real-time Updates**: Instant notifications and tier progression
- **Automatic Rewards**: Punch card completion and bonus points
- **No QR Scanning**: Points credited just by using linked payment card

## Integration Monitoring

### Success Indicators
- AWS sync status shows "Running"
- Transaction count increases in admin dashboard
- Users receive automatic point credits
- External transactions appear in admin panel

### Troubleshooting
- **Connection Failed**: Check AWS credentials in environment
- **No Transactions**: Verify Moma app is uploading to correct S3 path
- **Users Not Getting Points**: Ensure card numbers match user profiles

## Security & Best Practices

### AWS Security
- Use IAM roles with minimal required permissions
- Enable S3 bucket encryption
- Regularly rotate access keys
- Monitor CloudTrail for access logs

### Data Privacy
- Transaction data encrypted in transit and at rest
- Card numbers hashed for security
- Only authorized admin access to transaction details
- GDPR-compliant data handling

## Business Benefits

### For Operations
- **Reduced Manual Work**: No CSV uploads or manual processing
- **Real-time Analytics**: Instant visibility into sales and customer behavior
- **Scalable Processing**: Handles thousands of transactions automatically
- **Error Reduction**: Eliminates manual data entry mistakes

### For Customers
- **Frictionless Experience**: Points awarded automatically
- **Instant Gratification**: Real-time notifications and tier progression
- **No App Interaction Required**: Works with existing payment methods
- **Reliable Point Tracking**: Never miss points from purchases

## Technical Architecture

### Data Flow
1. **Moma Transaction** → AWS S3/SQS
2. **Hi-Vis Monitors** → AWS services every 5 minutes
3. **Automatic Processing** → Points awarded to users
4. **Real-time Updates** → Customer notifications sent

### Failsafe Features
- **Duplicate Prevention**: External transaction IDs prevent double-processing
- **Error Handling**: Failed transactions logged for manual review
- **Backup Methods**: CSV import still available as fallback
- **Data Integrity**: Checksums and validation on all imported data

## Next Steps

1. **Set up AWS credentials** in your Hi-Vis environment
2. **Configure Moma app** to export to AWS S3
3. **Test the integration** with a few sample transactions
4. **Monitor and optimize** based on transaction volume
5. **Train staff** on admin dashboard features

Your Hi-Vis Vending loyalty app is now ready for enterprise-scale automatic data integration with Moma vending machines!