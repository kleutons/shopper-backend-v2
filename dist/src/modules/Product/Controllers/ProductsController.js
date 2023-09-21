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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsControlles = void 0;
const ProductsRepository_1 = require("../Repositories/ProductsRepository");
const readline_1 = __importDefault(require("readline"));
const ValidadeProductsCSV_1 = require("../Services/ValidadeProductsCSV");
const productRepository = new ProductsRepository_1.ProductRepository();
const validadeCSV = new ValidadeProductsCSV_1.ValidadeProductsCSV();
class ProductsControlles {
    listProduct(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryParams = request.query;
            if ('code' in queryParams) {
                const productId = Number(queryParams.code);
                const result = yield productRepository.selectProduct([productId]);
                if (!Array.isArray(result)) {
                    reply.code(404).send(result);
                }
                else {
                    reply.send(result);
                }
            }
            else if ('unique' in queryParams) {
                const unique = queryParams.unique;
                const productsUnique = unique === 'false' ? false : true;
                const result = yield productRepository.selectProduct(undefined, productsUnique);
                if (!Array.isArray(result)) {
                    reply.code(404).send(result);
                }
                else {
                    reply.send(result);
                }
            }
            else {
                const result = yield productRepository.selectProduct();
                if (!Array.isArray(result)) {
                    reply.code(404).send(result);
                }
                else {
                    reply.send(result);
                }
            }
        });
    }
    checkCSV(file, request, reply) {
        var _a, e_1, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const productsLine = readline_1.default.createInterface({
                input: file
            });
            const headerFile = [];
            const contentFile = [];
            let headerLine = true;
            try {
                for (var _d = true, productsLine_1 = __asyncValues(productsLine), productsLine_1_1; productsLine_1_1 = yield productsLine_1.next(), _a = productsLine_1_1.done, !_a; _d = true) {
                    _c = productsLine_1_1.value;
                    _d = false;
                    let line = _c;
                    const lineSplit = line.split(',');
                    if (headerLine) {
                        headerLine = false;
                        headerFile.push(...lineSplit);
                    }
                    else {
                        contentFile.push([...lineSplit]);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = productsLine_1.return)) yield _b.call(productsLine_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            const resultValidade = yield validadeCSV.execute(headerFile, contentFile);
            reply.send(resultValidade);
        });
    }
    readAndProcessFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const productsLine = readline_1.default.createInterface({
                    input: file
                });
                const headerFile = [];
                const contentFile = [];
                let headerLine = true;
                productsLine.on('line', (line) => {
                    const lineSplit = line.split(',');
                    if (headerLine) {
                        headerLine = false;
                        headerFile.push(...lineSplit);
                    }
                    else {
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
        });
    }
    updateProductsCSV(file, request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { headerFile, contentFile } = yield this.readAndProcessFile(file);
                //Validate File
                const resultValidade = yield validadeCSV.execute(headerFile, contentFile);
                const dataHeader = resultValidade.errorHeader;
                const dataProducts = resultValidade.productsValidade;
                let isValidProducts = true;
                if (resultValidade && dataProducts) {
                    const hasInvalidCSV = dataProducts.find((item) => item.validadeError && item.validadeError.length > 0);
                    isValidProducts = hasInvalidCSV ? false : true;
                }
                if (resultValidade && dataHeader) {
                    reply.status(400).send('Csv inválido, valide o arquivo antes de prosseguir.');
                }
                else if (!isValidProducts) {
                    reply.status(400).send("Alguns produtos são inválidos, corrija-os antes de prosseguir.");
                }
                else if (resultValidade && !dataHeader && dataProducts && isValidProducts) {
                    const updateDB = dataProducts.map((item) => {
                        return {
                            code: Number(item.code),
                            sales_price: Number(item.new_price)
                        };
                    });
                    // Atualizar o banco de dados
                    const resultUpdate = yield productRepository.updateProducts(updateDB);
                    if (resultUpdate && resultUpdate.updateAll) {
                        reply.status(200).send("Atualização bem-sucedida");
                    }
                    else {
                        reply.status(400).send(resultUpdate.error);
                    }
                }
            }
            catch (error) {
                console.error(error);
                reply.status(500).send("Erro interno do servidor");
            }
        });
    }
}
exports.ProductsControlles = ProductsControlles;
