#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Running database migrations...');

const migrationsDir = path.join(__dirname, '..', 'migrations');
const migrations = fs.readdirSync(migrationsDir).sort();

console.log(`Found ${migrations.length} migration(s):`);
migrations.forEach(file => console.log(`  - ${file}`));

console.log('\n📋 Copy and run these SQL files in your Supabase SQL Editor:');
console.log('   https://app.supabase.com/project/_/sql');
console.log('\nMigration files are located in: ./migrations/\n');
