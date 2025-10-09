const { MongoClient } = require('mongodb');

const uri =
  'mongodb+srv://rajsharma222547_db_user:qK9iSmQ5rlrGXLfd@e-commerce.onxzeee.mongodb.net/development?retryWrites=true&w=majority';

async function testConnection() {
  console.log('Testing MongoDB connection...');
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  });

  try {
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');

    const db = client.db('development');
    const collections = await db.listCollections().toArray();
    console.log(
      '📁 Collections:',
      collections.map((c) => c.name)
    );
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.close();
  }
}

testConnection();
