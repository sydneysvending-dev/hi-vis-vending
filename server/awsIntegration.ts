import { S3Client, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { storage } from "./storage";

// AWS Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface MomaTransaction {
  date: string;
  amount: number;
  cardNumber?: string;
  product: string;
  machineId?: string;
  transactionId: string;
}

// Product point values based on requirements
const PRODUCT_POINT_VALUES = {
  LARGE_DRINK: 20,
  SMALL_DRINK: 10,
  SNACK: 15,
  DEFAULT: 10 // Fallback for unrecognized products
};

// Function to determine point value based on product name
function getProductPointValue(productName: string): number {
  const product = productName.toLowerCase();
  
  // Large drinks
  if (product.includes('large') || product.includes('600ml') || product.includes('750ml')) {
    return PRODUCT_POINT_VALUES.LARGE_DRINK;
  }
  
  // Small drinks  
  if (product.includes('small') || product.includes('250ml') || product.includes('330ml') || 
      product.includes('can') || product.includes('bottle') || product.includes('water') ||
      product.includes('coke') || product.includes('pepsi') || product.includes('sprite')) {
    return PRODUCT_POINT_VALUES.SMALL_DRINK;
  }
  
  // Snacks
  if (product.includes('chip') || product.includes('chocolate') || product.includes('bar') ||
      product.includes('snack') || product.includes('biscuit') || product.includes('cookie') ||
      product.includes('nuts') || product.includes('crackers')) {
    return PRODUCT_POINT_VALUES.SNACK;
  }
  
  return PRODUCT_POINT_VALUES.DEFAULT;
}

export class AWSMomaSync {
  private bucketName: string;
  private queueUrl: string;
  private isRunning: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.bucketName = process.env.MOMA_S3_BUCKET || "hi-vis-moma-data";
    this.queueUrl = process.env.MOMA_SQS_QUEUE || "";
  }

  // Start automatic sync service
  async startSync(intervalMinutes: number = 5): Promise<void> {
    if (this.isRunning) {
      console.log("AWS sync already running");
      return;
    }

    this.isRunning = true;
    console.log(`Starting AWS Moma sync with ${intervalMinutes} minute intervals`);

    // Initial sync
    await this.performSync();

    // Set up recurring sync
    this.syncInterval = setInterval(async () => {
      try {
        await this.performSync();
      } catch (error) {
        console.error("AWS sync error:", error);
      }
    }, intervalMinutes * 60 * 1000);
  }

  // Stop sync service
  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isRunning = false;
    console.log("AWS Moma sync stopped");
  }

  // Test AWS connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Test S3 access
      const s3Command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        MaxKeys: 1,
      });
      await s3Client.send(s3Command);

      // Test SQS access if queue URL is provided
      if (this.queueUrl) {
        const sqsCommand = new ReceiveMessageCommand({
          QueueUrl: this.queueUrl,
          MaxNumberOfMessages: 1,
          WaitTimeSeconds: 1,
        });
        await sqsClient.send(sqsCommand);
      }

      return {
        success: true,
        message: "AWS connection successful"
      };
    } catch (error) {
      console.error("AWS connection test failed:", error);
      return {
        success: false,
        message: `AWS connection failed: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }

  // Perform sync operation
  private async performSync(): Promise<void> {
    console.log("Starting AWS sync operation...");

    try {
      // Process SQS messages first (real-time notifications)
      if (this.queueUrl) {
        await this.processSQSMessages();
      }

      // Process S3 files (batch data)
      await this.processS3Files();

      console.log("AWS sync operation completed");
    } catch (error) {
      console.error("AWS sync operation failed:", error);
      throw error;
    }
  }

  // Process SQS messages for real-time transaction notifications
  private async processSQSMessages(): Promise<void> {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 5,
        MessageAttributeNames: ["All"],
      });

      const response = await sqsClient.send(command);
      const messages = response.Messages || [];

      for (const message of messages) {
        try {
          const transactionData = JSON.parse(message.Body || "{}");
          await this.processTransaction(transactionData);

          // Delete processed message
          await sqsClient.send(new DeleteMessageCommand({
            QueueUrl: this.queueUrl,
            ReceiptHandle: message.ReceiptHandle!,
          }));

          console.log(`Processed SQS transaction: ${transactionData.transactionId}`);
        } catch (error) {
          console.error("Error processing SQS message:", error);
        }
      }
    } catch (error) {
      console.error("Error processing SQS messages:", error);
    }
  }

  // Process S3 files for batch transaction data
  private async processS3Files(): Promise<void> {
    try {
      // List new files in the bucket
      const listCommand = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: "transactions/",
        MaxKeys: 100,
      });

      const response = await s3Client.send(listCommand);
      const objects = response.Contents || [];

      for (const object of objects) {
        if (!object.Key || !object.Key.endsWith(".json")) continue;

        try {
          // Get file content
          const getCommand = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: object.Key,
          });

          const fileResponse = await s3Client.send(getCommand);
          const fileContent = await fileResponse.Body?.transformToString();

          if (fileContent) {
            const transactions = JSON.parse(fileContent);
            
            // Process each transaction
            if (Array.isArray(transactions)) {
              for (const transaction of transactions) {
                await this.processTransaction(transaction);
              }
            } else {
              await this.processTransaction(transactions);
            }

            console.log(`Processed S3 file: ${object.Key}`);
          }
        } catch (error) {
          console.error(`Error processing S3 file ${object.Key}:`, error);
        }
      }
    } catch (error) {
      console.error("Error processing S3 files:", error);
    }
  }

  // Process individual transaction
  private async processTransaction(transactionData: MomaTransaction): Promise<void> {
    try {
      // Calculate product-specific points
      const pointsEarned = getProductPointValue(transactionData.product);
      
      // Convert to external transaction format with product-specific points
      const externalTransaction = {
        externalId: transactionData.transactionId,
        machineId: transactionData.machineId || "unknown",
        cardNumber: transactionData.cardNumber,
        amount: transactionData.amount,
        productName: transactionData.product,
        timestamp: new Date(transactionData.date),
        pointsEarned, // Add calculated points based on product type
      };

      // Process through existing external transaction system
      await storage.processExternalTransactionWithPoints(externalTransaction);
      
      console.log(`Processed transaction: ${transactionData.transactionId} - ${transactionData.product} (${pointsEarned} points)`);
    } catch (error) {
      console.error(`Error processing transaction ${transactionData.transactionId}:`, error);
    }
  }

  // Get sync status
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastSync: new Date().toISOString(),
      bucketName: this.bucketName,
      queueUrl: this.queueUrl ? "Configured" : "Not configured",
    };
  }

  // Manual sync trigger
  async triggerManualSync(): Promise<{ success: boolean; message: string }> {
    try {
      await this.performSync();
      return {
        success: true,
        message: "Manual sync completed successfully"
      };
    } catch (error) {
      return {
        success: false,
        message: `Manual sync failed: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
}

// Singleton instance
export const awsMomaSync = new AWSMomaSync();