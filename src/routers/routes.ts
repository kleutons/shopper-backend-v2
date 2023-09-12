import { FastifyInstance } from "fastify";
import productRoute from "./Product/produt.routes";

export default (fastify: FastifyInstance) => {
    // Rota Product
    productRoute(fastify, '/product');
};