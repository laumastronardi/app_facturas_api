import { AppDataSource } from './src/modules/config/data-source';

async function runMigration() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source initialized successfully');

    await AppDataSource.runMigrations();
    console.log('Migrations executed successfully');

    await AppDataSource.destroy();
    console.log('Data Source destroyed');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

runMigration(); 