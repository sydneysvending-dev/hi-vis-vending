// Demo script to simulate external vending machine transactions from Moma app
// This demonstrates how your vending machine data can be automatically processed

const DEMO_TRANSACTIONS = [
  {
    externalId: "MOMA_TX_001",
    machineId: "HIVIS_MACHINE_001", 
    cardNumber: "4532123456789012", // You'd set this in user profile
    amount: 350, // $3.50 in cents
    productName: "Coca Cola 600ml",
    timestamp: new Date().toISOString()
  },
  {
    externalId: "MOMA_TX_002", 
    machineId: "HIVIS_MACHINE_002",
    cardNumber: "4532123456789012",
    amount: 250, // $2.50 
    productName: "Mars Bar",
    timestamp: new Date().toISOString()
  },
  {
    externalId: "MOMA_TX_003",
    machineId: "HIVIS_MACHINE_001", 
    cardNumber: "4532987654321098", // Different user
    amount: 450, // $4.50
    productName: "Monster Energy 500ml", 
    timestamp: new Date().toISOString()
  }
];

async function sendTransactionToLoyaltyApp(transaction) {
  try {
    const response = await fetch('http://localhost:5000/api/external/transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction)
    });

    if (response.ok) {
      console.log(`✅ Transaction ${transaction.externalId} processed successfully`);
      console.log(`   - Product: ${transaction.productName}`);
      console.log(`   - Amount: $${(transaction.amount / 100).toFixed(2)}`);
      console.log(`   - Points earned: ${Math.floor(transaction.amount / 100) * 10}`); 
      console.log('');
    } else {
      console.log(`❌ Failed to process transaction ${transaction.externalId}`);
    }
  } catch (error) {
    console.log(`❌ Error processing transaction ${transaction.externalId}:`, error.message);
  }
}

async function runDemo() {
  console.log('🏗️  Hi-Vis Vending External Transaction Demo');
  console.log('===========================================');
  console.log('');
  console.log('This simulates how transactions from your Moma app would');
  console.log('automatically update user loyalty points in the Hi-Vis app.');
  console.log('');
  console.log('📡 Sending demo transactions...');
  console.log('');

  for (const transaction of DEMO_TRANSACTIONS) {
    await sendTransactionToLoyaltyApp(transaction);
    // Small delay between transactions
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('✅ Demo completed!');
  console.log('');
  console.log('💡 To set up automatic integration:');
  console.log('   1. Users link their payment card in the Hi-Vis app');
  console.log('   2. Your Moma app sends transaction data to our API');
  console.log('   3. Points are automatically awarded based on purchase amount');
  console.log('   4. Users get instant notifications about points earned');
  console.log('');
  console.log('🔗 Integration endpoint: POST /api/external/transaction');
}

// Run the demo
runDemo().catch(console.error);