import { FastifyReply, FastifyRequest } from "fastify";
import { ProductQuery } from "../../../../utils/product";
import { ProductRepository } from "../Repositories/ProductsRepository";
import { Readable } from "stream";
import readline from "readline";
import { ValidadeProductsCSV } from "../Services/ValidadeProductsCSV";
import { TypeProductValidade, TypeUpdateDB } from "../../../types/products";

const productRepository = new ProductRepository();
const validadeCSV = new ValidadeProductsCSV();


interface FileData {
    headerFile: string[];
    contentFile: string[][];
}

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

    async checkCSV(file: Readable, request: FastifyRequest, reply: FastifyReply ){
        
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

    async readAndProcessFile(file: Readable): Promise<FileData> {
        return new Promise<FileData>((resolve, reject) => {
            const productsLine = readline.createInterface({
                input: file
            });
    
            const headerFile: string[] = [];
            const contentFile: string[][] = [];
            let headerLine = true;
    
            productsLine.on('line', (line) => {
                const lineSplit = line.split(',');
                if (headerLine) {
                    headerLine = false;
                    headerFile.push(...lineSplit);
                } else {
                    contentFile.push([...lineSplit]);
                }
            });
    
            productsLine.on('close', () => {
                resolve({ headerFile, contentFile });
            });
    
            productsLine.on('error', (error) => {
                reject(error);
            });
        });
    }

    async updateProductsCSV(file: Readable, request: FastifyRequest, reply: FastifyReply) {
        try {
            const { headerFile, contentFile } = await this.readAndProcessFile(file);
            //Validate File
            const resultValidade = await validadeCSV.execute(headerFile, contentFile);
            const dataHeader = resultValidade.errorHeader;
            const dataProducts = resultValidade.productsValidade;
            let isValidProducts: boolean = true;

            if( resultValidade && dataProducts){
                const hasInvalidCSV = dataProducts.find((item:TypeProductValidade) => item.validadeError && item.validadeError.length > 0);
                isValidProducts = hasInvalidCSV ? false : true;
            }

            if (resultValidade && dataHeader) {
                reply.status(400).send('Csv inválido, valide o arquivo antes de prosseguir.');
            } else if (!isValidProducts) {
                reply.status(400).send("Alguns produtos são inválidos, corrija-os antes de prosseguir.");
            } else if( resultValidade && !dataHeader && dataProducts && isValidProducts) {
                const updateDB = dataProducts.map((item:TypeProductValidade):TypeUpdateDB => {
                    return {
                        code: Number(item.code),
                        sales_price: Number(item.new_price)
                    }
                })
                // Atualizar o banco de dados
                const resultUpdate = await productRepository.updateProducts(updateDB);
                if(resultUpdate && resultUpdate.updateAll){
                    reply.status(200).send("Atualização bem-sucedida");
                }else{
                    reply.status(400).send(resultUpdate.error);
                }
             
            }
        } catch (error) {
            console.error(error);
            reply.status(500).send("Erro interno do servidor");
        }
    }



}