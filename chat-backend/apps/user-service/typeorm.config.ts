import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { typeOrmDataSourceOptions } from './src/database/typeorm.config';

// Load .env file before creating DataSource
config({ path: '.env' });

export default new DataSource(typeOrmDataSourceOptions);

