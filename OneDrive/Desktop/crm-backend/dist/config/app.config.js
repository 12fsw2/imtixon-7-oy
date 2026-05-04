"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('app', () => ({
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
    name: process.env.APP_NAME || 'CRM-SRM Backend',
    throttleTtl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
    throttleLimit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,
}));
//# sourceMappingURL=app.config.js.map