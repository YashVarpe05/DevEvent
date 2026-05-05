import { loadEnvConfig } from '@next/env';
const projectDir = process.cwd();
loadEnvConfig(projectDir);

import connectDB from '../lib/mongodb';
import * as models from '../database';

async function ensureIndexes() {
  try {
    const uri = process.env.MONGODB_URI || '';
    console.log(`Using MONGODB_URI: ${uri.substring(0, 20)}...`);
    console.log('Connecting to database...');
    await connectDB();
    console.log('Connected to database successfully.');

    console.log('Syncing indexes for all models...');
    
    // Iterate through all exported models
    for (const [modelName, Model] of Object.entries(models)) {
      // Check if the export is a mongoose model (has syncIndexes function)
      if (Model && typeof (Model as any).syncIndexes === 'function') {
        console.log(`Syncing indexes for ${modelName}...`);
        await (Model as any).syncIndexes();
        console.log(`✓ Indexes synced for ${modelName}`);
      }
    }

    console.log('\n🎉 All database indexes synced successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing indexes:', error);
    process.exit(1);
  }
}

ensureIndexes();
