import { FastifyReply, FastifyRequest } from "fastify";
import { ProductQuery } from "../../../../utils/product";
import { ProductRepository } from "../Repositories/ProductsRepository";
import { Readable } from "stream";
import readline from "readline";
import { ValidadeProductsCSV } from "../Services/ValidadeProductsCSV";

const productRepository = new ProductRepository();
const validadeCSV = new ValidadeProductsCSV();

export class ProductsControlles{
    async listProduct(request: FastifyRequest<{ Querystring: ProductQuery }>, reply: FastifyReply) {
        const queryParams = request.query;

        if ('code' in queryParams) {
            const productId = Number(queryParams.code);
            const result: any = await productRepository.selectProduct([productId]);

            if (!Array.isArray(result)) {
                reply.code(404).send(result)
            } else {
                reply.send(result)
            }

        } else if ('unique' in queryParams) {
            const unique = queryParams.unique;
            const productsUnique: boolean = unique === 'false' ? false : true;
        
            const result: any = await productRepository.selectProduct(undefined, productsUnique);

            if (!Array.isArray(result)) {
                reply.code(404).send(result)
            } else {
                reply.send(result)
            }

        } else {
            
            const result: any = await productRepository.selectProduct();

            if (!Array.isArray(result)) {
                reply.code(404).send(result)
            } else {
                reply.send(result)
            }
        }
        
    }

    async checkCSV(file: Readable , request: FastifyRequest, reply: FastifyReply ){
        
        const productsLine = readline.createInterface({
            input: file
        })
        
        const headerFile: string[] = [];
        const contentFile: string[][] = []; 
        let headerLine = true;

        for await (let line of productsLine) {
            const lineSplit = line.split(',');
            if (headerLine) {
                headerLine = false;
                headerFile.push(...lineSplit);
            } else {
                contentFile.push([...lineSplit]);
            }
        }

        const resultValidade = await validadeCSV.execute(headerFile, contentFile);
        
        reply.send(resultValidade);
    }

    updateProductsCSV(request: FastifyRequest, reply: FastifyReply ){
        reply.send('Updade bulk CSV');
    }
}