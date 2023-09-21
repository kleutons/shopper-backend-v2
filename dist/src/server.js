"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = require("fastify");
const cors_1 = __importDefault(require("@fastify/cors"));
const routes_1 = __importDefault(require("./routers/routes"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const server = (0, fastify_1.fastify)();
const port = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 10000;
server.get('/', () => {
    return 'Server is Run!';
});
// Registrar o plugin @fastify/cors
server.register(cors_1.default, {
    origin: "*",
    methods: "GET,POST,PUT,DELETE", // Métodos HTTP permitidos
});
(0, routes_1.default)(server);
server.listen({
    port: port
}, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server is Run port ${port} Acesse: ${address}`);
});
