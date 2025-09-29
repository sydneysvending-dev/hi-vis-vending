# AWS Integration Setup Guide for Hi-Vis Vending

This guide explains how to set up AWS services to automatically transfer transaction data from your Moma vending machines to the Hi-Vis loyalty app.

## Overview

The AWS integration provides two methods for data transfer:
1. **S3 Bucket**: For batch file uploads from Moma app
2. **SQS Queue**: For real-time transaction notifications (optional)

## Prerequisites

- AWS Account with appropriate permissions
- Moma app with AWS export capability
- Hi-Vis Vending admin access

## Step 1: AWS Credentials Setup

### 1.1 Create IAM User
1. Log into AWS Console
2. Navigate to IAM → Users
3. Create new user: `hi-vis-moma-sync`
4. Attach policies:
   - `AmazonS3FullAccess` (or custom policy for your bucket)
   - `AmazonSQSFullAccess` (if using SQS)

### 1.2 Environment Variables
Add these credentials to your Hi-Vis app environment:

```bash
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
MOMA_S3_BUCKET=hi-vis-moma-data
MOMA_SQS_QUEUE=https://sqs.us-east-1.amazonaws.com/.../hi-vis-transaction-notifications
```

## Step 2: S3 Bucket Configuration

### 2.1 Create S3 Bucket
```bash
aws s3 mb s3://hi-vis-moma-data --region us-east-1
```

### 2.2 Folder Structure
```
hi-vis-moma-data/
├── transactions/
│   ├── 2025-01-01/
│   │   ├── batch-001.json
│   │   └── batch-002.json
│   └── 2025-01-02/
│       └── batch-003.json
└── processed/
    └── archive/
```

### 2.3 Expected JSON Format
```json
[
  {
    "transactionId": "TXN-20250101-001",
    "date": "2025-01-01T14:30:00Z",
    "amount": 350,
    "cardNumber": "1234",
    "product": "Large Coffee",
    "machineId": "VEND-001"
  }
]
```

## Step 3: SQS Queue Setup (Optional)

### 3.1 Create SQS Queue
```bash
aws sqs create-queue \
  --queue-name hi-vis-transaction-notifications \
  --region us-east-1
```

### 3.2 Message Format
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

## Step 4: Moma App Configuration

### 4.1 S3 Upload Settings
Configure your Moma app to:
- Export transaction data every 15 minutes
- Upload to: `s3://hi-vis-moma-data/transactions/`
- File format: JSON
- Include: date, amount, card_number, product, machine_id

### 4.2 SQS Notifications (Optional)
For real-time sync, configure Moma to send SQS messages:
- Queue URL: `https://sqs.us-east-1.amazonaws.com/.../hi-vis-transaction-notifications`
- Message format: JSON transaction data

## Step 5: Testing the Integration

### 5.1 Test S3 Upload
1. Upload a test transaction file to S3
2. Check Hi-Vis admin dashboard → AWS Integration tab
3. Click "Test Connection" - should show success
4. Click "Start AWS Sync" to begin monitoring

### 5.2 Verify Data Processing
1. Check external transactions in admin dashboard
2. Verify points are awarded to users automatically
3. Monitor logs for any processing errors

## Data Mapping

The AWS integration automatically maps transaction data:

| Moma Field | Hi-Vis Field | Notes |
|------------|--------------|-------|
| date | date | ISO 8601 format |
| amount | amount | Cents (350 = $3.50) |
| card_number | cardNumber | Links to user accounts |
| product | product | Description |
| machine_id | machineId | Vending machine identifier |
| transaction_id | externalId | Unique transaction ID |

## Points Calculation

- **10 points per dollar spent**
- Example: $3.50 purchase = 35 points
- Automatic tier progression based on total points
- Punch card progress (1 punch per purchase)

## Troubleshooting

### Common Issues

1. **AWS Connection Failed**
   - Verify credentials in environment variables
   - Check IAM permissions
   - Ensure S3 bucket exists

2. **Transactions Not Processing**
   - Check S3 folder structure matches expected format
   - Verify JSON format is correct
   - Check Hi-Vis logs for parsing errors

3. **Users Not Getting Points**
   - Ensure card numbers match user profiles
   - Check that card numbers are linked in user accounts
   - Verify transaction amounts are in correct format

### Support

For technical support with AWS integration:
1. Check Hi-Vis admin dashboard logs
2. Verify AWS CloudWatch logs
3. Contact Hi-Vis technical support with error details

## Security Considerations

- Use IAM roles with minimal required permissions
- Enable S3 bucket encryption
- Consider VPC endpoints for private network access
- Regularly rotate AWS access keys
- Monitor AWS CloudTrail for access logs

## Cost Optimization

- Configure S3 lifecycle policies to archive old files
- Use SQS only for real-time requirements
- Monitor AWS costs through Cost Explorer
- Consider S3 Intelligent Tiering for cost savings