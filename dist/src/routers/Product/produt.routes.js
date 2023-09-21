"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ProductsController_1 = require("../../modules/Product/Controllers/ProductsController");
const fastify_multer_1 = __importDefault(require("fastify-multer"));
const stream_1 = require("stream");
const storage = fastify_multer_1.default.memoryStorage();
const upload = (0, fastify_multer_1.default)({ storage: storage });
const productsControlles = new ProductsController_1.ProductsControlles();
function productRoute(server, baseUrlRouter) {
    server.register(fastify_multer_1.default.contentParser);
    server.get(baseUrlRouter, (request, reply) => {
        productsControlles.listProduct(request, reply);
    });
    server.post(baseUrlRouter + '/update-csv', { preHandler: upload.single('file') }, (request, reply) => __awaiter(this, void 0, void 0, function* () {
        if (!request.file) {
            reply.status(400).send("Nenhum arquivo foi enviado");
            return;
        }
        const { buffer } = request.file;
        const fileCSV = new stream_1.Readable();
        fileCSV.push(buffer);
        fileCSV.push(null);
        yield productsControlles.checkCSV(fileCSV, request, reply);
    }));
    server.put(baseUrlRouter + '/update-csv', { preHandler: upload.single('file') }, (request, reply) => __awaiter(this, void 0, void 0, function* () {
        if (!request.file) {
            reply.status(400).send("Nenhum arquivo foi enviado");
            return;
        }
        const { buffer } = request.file;
        const fileCSV = new stream_1.Readable();
        fileCSV.push(buffer);
        fileCSV.push(null);
        yield productsControlles.updateProductsCSV(fileCSV, request, reply);
    }));
}
exports.default = productRoute;
