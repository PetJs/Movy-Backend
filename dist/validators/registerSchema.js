"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchemaValidator = void 0;
const Joi = require("joi");
exports.registerSchemaValidator = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
    confirmPassword: Joi.string().required()
});
//# sourceMappingURL=registerSchema.js.map