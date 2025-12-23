import { config } from 'dotenv';
import { join } from 'path';

// Load .env file from project root FIRST (before any imports)
const envPath = join(__dirname, '../../.env');
config({ path: envPath });

// Debug: Check if USER_DB_URL is loaded
console.log('Loading .env from:', envPath);
console.log('USER_DB_URL loaded:', process.env.USER_DB_URL ? '✓ Yes' : '✗ No');
if (!process.env.USER_DB_URL) {
  console.error('⚠️  USER_DB_URL not found in .env file!');
  console.error('⚠️  Please check your .env file contains USER_DB_URL');
}

// ONLY NOW import DataSource (after .env is loaded)
import { DataSource } from 'typeorm';
import { typeOrmDataSourceOptions } from './src/database/typeorm.config';

export default new DataSource(typeOrmDataSourceOptions);
