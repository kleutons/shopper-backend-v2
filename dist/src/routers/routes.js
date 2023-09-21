"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const produt_routes_1 = __importDefault(require("./Product/produt.routes"));
exports.default = (fastify) => {
    // Rota Product
    (0, produt_routes_1.default)(fastify, '/product');
};
