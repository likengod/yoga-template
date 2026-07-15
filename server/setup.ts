import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import mysql from 'mysql2/promise';

const execPromise = util.promisify(exec);

export async function checkSetupStatus(): Promise<boolean> {
  try {
    if (!process.env.DATABASE_URL || !process.env.ADMIN_PASSWORD) {
      return false;
    }
    const prisma = new PrismaClient();
    await prisma.$connect();
    // Query a table to ensure schema is pushed
    await prisma.popupSetting.findFirst();
    await prisma.$disconnect();
    return true;
  } catch (e) {
    return false;
  }
}

export interface SetupConfig {
  dbProvider: 'mysql' | 'sqlite';
  dbHost?: string;
  dbPort?: string;
  dbUser?: string;
  dbPassword?: string;
  dbName?: string;
  sqlitePath?: string;
  adminEmail?: string;
  adminPassword?: string;
  jwtSecret?: string;
  port?: string;
}

export async function saveConfigAndInitialize(config: SetupConfig): Promise<{ success: boolean; message?: string }> {
  try {
    // 0. Connection validation check
    if (config.dbProvider === 'mysql') {
      try {
        // Connect to MySQL server without a database name first (to create database if not exists)
        const connection = await mysql.createConnection({
          host: config.dbHost || '127.0.0.1',
          port: Number(config.dbPort) || 3306,
          user: config.dbUser || 'root',
          password: config.dbPassword || '',
          connectTimeout: 5000,
        });
        
        const dbName = config.dbName || 'shaakti';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        await connection.end();

        // Connect again with database name parameter to confirm access permission to the database
        const dbConnection = await mysql.createConnection({
          host: config.dbHost || '127.0.0.1',
          port: Number(config.dbPort) || 3306,
          user: config.dbUser || 'root',
          password: config.dbPassword || '',
          database: dbName,
          connectTimeout: 5000,
        });
        await dbConnection.end();
      } catch (mysqlError: any) {
        return {
          success: false,
          message: `Database Connection Failed: ${mysqlError.message || String(mysqlError)}\n\nPlease verify that your Database Host, Port, Username, and Password are correct and that your MySQL server is running.`
        };
      }
    } else if (config.dbProvider === 'sqlite') {
      try {
        const sqlitePath = config.sqlitePath || './dev.db';
        const absolutePath = path.isAbsolute(sqlitePath) ? sqlitePath : path.resolve(process.cwd(), sqlitePath);
        const dir = path.dirname(absolutePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(absolutePath + '.test', 'test', 'utf8');
        fs.unlinkSync(absolutePath + '.test');
      } catch (sqliteError: any) {
        return {
          success: false,
          message: `SQLite directory is not writeable: ${sqliteError.message || String(sqliteError)}`
        };
      }
    }

    // 1. Build DATABASE_URL
    let databaseUrl = '';
    if (config.dbProvider === 'sqlite') {
      const dbPath = config.sqlitePath || './dev.db';
      databaseUrl = `file:${dbPath}`;
    } else {
      const host = config.dbHost || '127.0.0.1';
      const port = config.dbPort || '3306';
      const user = config.dbUser || 'root';
      const password = encodeURIComponent(config.dbPassword || '');
      const dbName = config.dbName || 'shaakti';
      databaseUrl = `mysql://${user}:${password}@${host}:${port}/${dbName}`;
    }

    const adminEmail = config.adminEmail || 'admin@example.com';
    const adminPassword = config.adminPassword || 'admin123';
    const jwtSecret = config.jwtSecret || 'shakti-yoga-super-secret-key';
    const serverPort = config.port || '3000';

    // 2. Build .env content
    const envContent = `PORT=${serverPort}
DATABASE_URL="${databaseUrl}"
ADMIN_EMAIL="${adminEmail}"
ADMIN_PASSWORD="${adminPassword}"
JWT_SECRET="${jwtSecret}"
NODE_ENV="production"
`;

    // 3. Write .env to current directory and server directory
    const rootEnvPath = path.join(process.cwd(), '.env');
    fs.writeFileSync(rootEnvPath, envContent, 'utf8');

    const serverEnvPath = path.join(process.cwd(), 'server', '.env');
    try {
      if (fs.existsSync(path.join(process.cwd(), 'server'))) {
        fs.writeFileSync(serverEnvPath, envContent, 'utf8');
      }
    } catch (e) {
      // ignore
    }

    // 4. Update process.env so current process knows about the new database url
    process.env.DATABASE_URL = databaseUrl;
    process.env.ADMIN_PASSWORD = adminPassword;
    process.env.JWT_SECRET = jwtSecret;
    process.env.PORT = serverPort;

    // 5. Update schema.prisma provider
    const schemaPath = path.join(process.cwd(), 'server', 'prisma', 'schema.prisma');
    const localSchemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    
    let targetSchemaPath = '';
    if (fs.existsSync(schemaPath)) {
      targetSchemaPath = schemaPath;
    } else if (fs.existsSync(localSchemaPath)) {
      targetSchemaPath = localSchemaPath;
    }

    if (targetSchemaPath) {
      let schemaContent = fs.readFileSync(targetSchemaPath, 'utf8');
      // replace provider in the datasource block only (avoiding generator provider)
      schemaContent = schemaContent.replace(/(datasource\s+db\s*\{[^}]*provider\s*=\s*)"[^"]*"/, `$1"${config.dbProvider}"`);
      fs.writeFileSync(targetSchemaPath, schemaContent, 'utf8');
    }

    // 6. Run npx prisma db push programmatically
    const cwd = fs.existsSync(path.join(process.cwd(), 'server')) ? path.join(process.cwd(), 'server') : process.cwd();
    const schemaFlag = targetSchemaPath ? ` --schema="${targetSchemaPath}"` : '';
    
    // Generate client first (safely handle EPERM locks on Windows if server is running)
    try {
      await execPromise(`npx prisma generate${schemaFlag}`, { cwd });
    } catch (genError: any) {
      const errorStr = `${genError.message || ''} ${genError.stderr || ''} ${String(genError)}`;
      if (
        errorStr.includes('EPERM') || 
        errorStr.includes('operation not permitted') || 
        errorStr.includes('query_engine')
      ) {
        console.log('Prisma generate skipped: engine binary is currently locked (in use).');
      } else {
        throw genError;
      }
    }
    
    // Push DB schema
    await execPromise(`npx prisma db push${schemaFlag} --accept-data-loss`, { cwd });

    // Seed admin, superadmin, and instructor users
    try {
      console.log('Seeding setup admin and system users...');
      const prismaClient = new PrismaClient();
      
      // Admin (configured in Setup Wizard) - set as superadmin
      await prismaClient.user.upsert({
        where: { id: '000001' },
        update: {
          username: 'admin',
          email: adminEmail,
          password: adminPassword,
          role: 'superadmin',
        },
        create: {
          id: '000001',
          username: 'admin',
          email: adminEmail,
          password: adminPassword,
          role: 'superadmin',
        }
      });

      // Remove default superadmin if exists (for security)
      await prismaClient.user.delete({
        where: { id: '000003' }
      }).catch(() => {});

      // Instructor
      await prismaClient.user.upsert({
        where: { id: '000004' },
        update: {
          username: 'instructor',
          email: 'instructor@example.com',
          password: 'teacher123',
          role: 'instructor',
        },
        create: {
          id: '000004',
          username: 'instructor',
          email: 'instructor@example.com',
          password: 'teacher123',
          role: 'instructor',
        }
      });

      await prismaClient.$disconnect();
      console.log('Setup admin and system users seeded successfully.');
    } catch (adminSeedError: any) {
      console.log('Admin user seeding warning (non-fatal):', adminSeedError.message || adminSeedError);
    }

    // Seed initial data
    try {
      console.log('Seeding initial data...');
      await execPromise(`node seedClasses.js`, { cwd });
      await execPromise(`node seedInstructors.js`, { cwd });
      await execPromise(`node seed_policies.js`, { cwd });
      await execPromise(`node seedGallery.js`, { cwd });
      await execPromise(`node seedArticles.js`, { cwd });
      console.log('Initial data seeded successfully.');
    } catch (seedError: any) {
      console.log('Database seeding warning (non-fatal):', seedError.message || seedError);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Setup initialization failed:', error);
    return { success: false, message: error.message || String(error) };
  }
}
