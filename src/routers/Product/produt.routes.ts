import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ProductQuery } from "../../../utils/product";
import { ProductsControlles } from "../../modules/Product/Controllers/ProductsController";
import multer from 'fastify-multer'
import { Readable } from "stream";


const storage = multer.memoryStorage()
const upload = multer({ storage: storage });


// Estendendo a tipagem do FastifyRequest
interface CustomFastifyRequest extends FastifyRequest {
    file?: {
      buffer: Buffer;
      encoding: string;
      fieldname: string;
      mimetype: string;
      originalname: string;
      size: number;
    };
  }



const productsControlles = new ProductsControlles();

export default function productRoute(server: FastifyInstance, baseUrlRouter: string ){

    server.register(multer.contentParser);

     server.get<{ Querystring: ProductQuery }>(baseUrlRouter, (request, reply) => {
        productsControlles.listProduct(request, reply);
    });

    server.post(baseUrlRouter+'/update-csv',
                { preHandler: upload.single('file') }, 
                async (request: CustomFastifyRequest, reply: FastifyReply) => {        

        if (!request.file) {
            reply.status(400).send("Nenhum arquivo foi enviado");
            return;
        }
        
        const { buffer } = request.file;
        const fileCSV = new Readable();
        fileCSV.push(buffer);
        fileCSV.push(null);

       await productsControlles.checkCSV(fileCSV, request, reply);

    });   

    server.put(baseUrlRouter+'/update-csv', (request, reply) => {
        productsControlles.updateProductsCSV(request, reply);
    });
}
