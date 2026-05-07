"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EduModules1778129795879 = void 0;
class EduModules1778129795879 {
    constructor() {
        this.name = 'EduModules1778129795879';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_554d853741f2083faaa5794d2ae"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "departmentId"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ADD "departmentId" uuid`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_554d853741f2083faaa5794d2ae" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }
}
exports.EduModules1778129795879 = EduModules1778129795879;
//# sourceMappingURL=1778129795879-EduModules.js.map