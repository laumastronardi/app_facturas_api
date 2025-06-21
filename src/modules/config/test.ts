// src/modules/config/test.ts
import { AppDataSource } from './data-source';

AppDataSource.initialize().then(() => {
  console.log('✅ Connection successful');
}).catch(err => {
  console.error('❌ Error initializing:', err);
});
