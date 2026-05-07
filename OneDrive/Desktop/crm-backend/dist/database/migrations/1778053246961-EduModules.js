"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EduModules1778053246961 = void 0;
class EduModules1778053246961 {
    constructor() {
        this.name = 'EduModules1778053246961';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."students_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'GRADUATED', 'EXPELLED')`);
        await queryRunner.query(`CREATE TABLE "students" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "phone" character varying NOT NULL, "email" character varying, "parentPhone" character varying, "address" character varying, "birthDate" date, "status" "public"."students_status_enum" NOT NULL DEFAULT 'ACTIVE', "note" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_317b86154bca256bdf5432f134c" UNIQUE ("phone"), CONSTRAINT "UQ_25985d58c714a4a427ced57507b" UNIQUE ("email"), CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."payments_status_enum" AS ENUM('PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED')`);
        await queryRunner.query(`CREATE TYPE "public"."payments_method_enum" AS ENUM('CASH', 'CARD', 'TRANSFER')`);
        await queryRunner.query(`CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "studentId" uuid NOT NULL, "groupId" uuid, "amount" numeric(10,2) NOT NULL, "discount" numeric(10,2) NOT NULL DEFAULT '0', "paidAmount" numeric(10,2) NOT NULL DEFAULT '0', "status" "public"."payments_status_enum" NOT NULL DEFAULT 'PENDING', "method" "public"."payments_method_enum" NOT NULL DEFAULT 'CASH', "month" character varying, "note" character varying, "cashierId" uuid, "paidAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."groups_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'COMPLETED')`);
        await queryRunner.query(`CREATE TABLE "groups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "courseId" uuid, "teacherId" uuid, "status" "public"."groups_status_enum" NOT NULL DEFAULT 'ACTIVE', "startDate" date, "endDate" date, "schedule" character varying, "room" character varying, "maxStudents" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "group_students" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "groupId" uuid NOT NULL, "studentId" uuid NOT NULL, "joinedAt" date, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cd596d1c8176853f748dc44af4b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "grades" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "studentId" uuid NOT NULL, "groupId" uuid NOT NULL, "score" numeric(5,2) NOT NULL, "topic" character varying, "note" character varying, "date" date, "gradedById" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4740fb6f5df2505a48649f1687b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."courses_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'COMPLETED')`);
        await queryRunner.query(`CREATE TABLE "courses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "price" numeric(10,2) NOT NULL DEFAULT '0', "duration" integer, "status" "public"."courses_status_enum" NOT NULL DEFAULT 'ACTIVE', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."attendances_status_enum" AS ENUM('PRESENT', 'ABSENT', 'LATE', 'EXCUSED')`);
        await queryRunner.query(`CREATE TABLE "attendances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "studentId" uuid NOT NULL, "groupId" uuid NOT NULL, "date" date NOT NULL, "status" "public"."attendances_status_enum" NOT NULL DEFAULT 'PRESENT', "note" character varying, "markedById" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_483ed97cd4cd43ab4a117516b69" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('SUPER_ADMIN', 'ADMIN', 'EMPLOYEE', 'TEACHER', 'STUDENT', 'CASHIER')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::"text"::"public"."users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'EMPLOYEE'`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_b2731e10aef7f886a08c552290e" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_09739b0587054798a29e7eb17df" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_78d6f6ed3fe30600f4ab5806604" FOREIGN KEY ("cashierId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_89ce024cb71a24a02b09fb8f879" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_e63173ac43b478c2fc0cc20ac39" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_students" ADD CONSTRAINT "FK_db9a438a218989ecaa69acc225e" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_students" ADD CONSTRAINT "FK_673797eb80fe17fe53d74ae049b" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "grades" ADD CONSTRAINT "FK_fcfc027e4e5fb37a4372e688070" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "grades" ADD CONSTRAINT "FK_2edf6aa605759ec7c5e78d89ab8" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "grades" ADD CONSTRAINT "FK_bb2c0b9046d01f4f6b1396f7803" FOREIGN KEY ("gradedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendances" ADD CONSTRAINT "FK_615b414059091a9a8ea0355ae89" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendances" ADD CONSTRAINT "FK_960f6ee431b5d708e91021fc23e" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendances" ADD CONSTRAINT "FK_d3e8821145edf7a44469bfe391a" FOREIGN KEY ("markedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT "FK_d3e8821145edf7a44469bfe391a"`);
        await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT "FK_960f6ee431b5d708e91021fc23e"`);
        await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT "FK_615b414059091a9a8ea0355ae89"`);
        await queryRunner.query(`ALTER TABLE "grades" DROP CONSTRAINT "FK_bb2c0b9046d01f4f6b1396f7803"`);
        await queryRunner.query(`ALTER TABLE "grades" DROP CONSTRAINT "FK_2edf6aa605759ec7c5e78d89ab8"`);
        await queryRunner.query(`ALTER TABLE "grades" DROP CONSTRAINT "FK_fcfc027e4e5fb37a4372e688070"`);
        await queryRunner.query(`ALTER TABLE "group_students" DROP CONSTRAINT "FK_673797eb80fe17fe53d74ae049b"`);
        await queryRunner.query(`ALTER TABLE "group_students" DROP CONSTRAINT "FK_db9a438a218989ecaa69acc225e"`);
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_e63173ac43b478c2fc0cc20ac39"`);
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_89ce024cb71a24a02b09fb8f879"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_78d6f6ed3fe30600f4ab5806604"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_09739b0587054798a29e7eb17df"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_b2731e10aef7f886a08c552290e"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum_old" AS ENUM('SUPER_ADMIN', 'ADMIN', 'EMPLOYEE')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum_old" USING "role"::"text"::"public"."users_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'EMPLOYEE'`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum_old" RENAME TO "users_role_enum"`);
        await queryRunner.query(`DROP TABLE "attendances"`);
        await queryRunner.query(`DROP TYPE "public"."attendances_status_enum"`);
        await queryRunner.query(`DROP TABLE "courses"`);
        await queryRunner.query(`DROP TYPE "public"."courses_status_enum"`);
        await queryRunner.query(`DROP TABLE "grades"`);
        await queryRunner.query(`DROP TABLE "group_students"`);
        await queryRunner.query(`DROP TABLE "groups"`);
        await queryRunner.query(`DROP TYPE "public"."groups_status_enum"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TYPE "public"."payments_method_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
        await queryRunner.query(`DROP TABLE "students"`);
        await queryRunner.query(`DROP TYPE "public"."students_status_enum"`);
    }
}
exports.EduModules1778053246961 = EduModules1778053246961;
//# sourceMappingURL=1778053246961-EduModules.js.map