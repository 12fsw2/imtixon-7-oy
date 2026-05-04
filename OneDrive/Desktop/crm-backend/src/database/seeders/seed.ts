import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'crm_srm_db',
    entities: [path.resolve(__dirname, '../../**/*.entity{.ts,.js}')],
    synchronize: true,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected for seeding');

    const userRepository = dataSource.getRepository('users');

    // Check if super admin already exists
    const existingSuperAdmin = await userRepository.findOne({
      where: { email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@company.com' },
    });

    if (existingSuperAdmin) {
      console.log('⚠️  Super Admin already exists, skipping seed');
    } else {
      const hashedPassword = await bcrypt.hash(
        process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
        10,
      );

      const superAdmin = userRepository.create({
        email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@company.com',
        password: hashedPassword,
        firstName: process.env.SUPER_ADMIN_FIRST_NAME || 'Super',
        lastName: process.env.SUPER_ADMIN_LAST_NAME || 'Admin',
        role: 'SUPER_ADMIN',
        isActive: true,
        position: 'System Administrator',
      });

      await userRepository.save(superAdmin);
      console.log('✅ Super Admin created successfully!');
      console.log(`   Email: ${superAdmin.email}`);
      console.log(`   Password: ${process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123'}`);
    }

    // Seed sample departments
    const departmentRepository = dataSource.getRepository('departments');
    const departments = ['Engineering', 'Marketing', 'HR', 'Finance', 'Operations'];

    for (const deptName of departments) {
      const exists = await departmentRepository.findOne({ where: { name: deptName } });
      if (!exists) {
        await departmentRepository.save(
          departmentRepository.create({ name: deptName, isActive: true }),
        );
        console.log(`✅ Department created: ${deptName}`);
      }
    }

    console.log('\n🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

seed().catch(console.error);
