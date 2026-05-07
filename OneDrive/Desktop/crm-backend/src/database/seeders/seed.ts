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
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected for seeding');

    const userRepository = dataSource.getRepository('users');

    // Super Admin
    const existingSuperAdmin = await userRepository.findOne({
      where: { email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@company.com' },
    });

    if (existingSuperAdmin) {
      console.log('⚠️  Super Admin already exists, skipping');
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
      console.log('✅ Super Admin yaratildi!');
      console.log(`   Email: ${superAdmin.email}`);
      console.log(`   Password: ${process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123'}`);
    }

    // Sample Courses
    const courseRepository = dataSource.getRepository('courses');
    const courses = [
      { name: 'Frontend Development', description: 'HTML, CSS, JavaScript, React', price: 1200000, duration: 4 },
      { name: 'Backend Development', description: 'NestJS, PostgreSQL, TypeORM', price: 1500000, duration: 5 },
      { name: 'Mobile Development', description: 'Flutter, Dart', price: 1300000, duration: 4 },
      { name: 'UI/UX Design', description: 'Figma, Adobe XD', price: 900000, duration: 3 },
    ];

    for (const course of courses) {
      const exists = await courseRepository.findOne({ where: { name: course.name } });
      if (!exists) {
        await courseRepository.save(courseRepository.create({ ...course, status: 'ACTIVE' }));
        console.log(`✅ Kurs yaratildi: ${course.name}`);
      }
    }

    console.log('\n🎉 Seeding muvaffaqiyatli yakunlandi!');
  } catch (error) {
    console.error('❌ Seeding xatolik:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

seed().catch(console.error);