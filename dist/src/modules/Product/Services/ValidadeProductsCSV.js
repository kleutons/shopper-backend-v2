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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidadeProductsCSV = void 0;
const products_1 = require("../../../types/products");
const PackRepository_1 = require("../Repositories/PackRepository");
const ProductsRepository_1 = require("../Repositories/ProductsRepository");
const productRepository = new ProductsRepository_1.ProductRepository();
const packRepository = new PackRepository_1.PackRepository();
class ValidadeProductsCSV {
    constructor() {
        // Config
        this.limitColumns = 2; // tamanho maximo de colunas no arquivo CSV
    }
    execute(headerFile, contentFile) {
        var _a, contentFile_1, contentFile_1_1;
        var _b, e_1, _c, _d;
        var _e;
        return __awaiter(this, void 0, void 0, function* () {
            const productsValidade = [];
            const errorHeader = this.checkHeaderLine(headerFile);
            if (errorHeader) {
                return { errorHeader };
            }
            function pushError(name, code, newPrice, msgError) {
                return {
                    code: code,
                    name: name,
                    cost_price: 0,
                    sales_price: 0,
                    new_price: newPrice,
                    typeProduct: products_1.TypeEnumProduct.UNIQUE,
                    composePack: null,
                    validadeError: msgError
                };
            }
            try {
                for (_a = true, contentFile_1 = __asyncValues(contentFile); contentFile_1_1 = yield contentFile_1.next(), _b = contentFile_1_1.done, !_b; _a = true) {
                    _d = contentFile_1_1.value;
                    _a = false;
                    let line = _d;
                    const lineCodeProduct = Number(line[0]);
                    const lineNewpriceProduct = Number(line[1]);
                    //valida se dados da linha estão preenchidos corretamente, 
                    const errorValidLine = this.checkValuesLine(line);
                    if (errorValidLine) {
                        productsValidade.push(pushError('---', lineCodeProduct, lineNewpriceProduct, errorValidLine));
                    }
                    else {
                        yield ((_e = productRepository.selectProduct([lineCodeProduct])) === null || _e === void 0 ? void 0 : _e.then((itemProduct) => __awaiter(this, void 0, void 0, function* () {
                            if (Array.isArray(itemProduct) && itemProduct.length > 0) {
                                const selectProduct = itemProduct[0];
                                let typeProductSelect = products_1.TypeEnumProduct.UNIQUE;
                                let composePackSelect = null;
                                const listErrors = [];
                                // Valida Novo Preço
                                const checkNewPrice = this.checkNewPrice(lineNewpriceProduct, selectProduct.sales_price, selectProduct.cost_price);
                                if (checkNewPrice) {
                                    listErrors.push(...checkNewPrice);
                                }
                                //Valida Packs
                                const selectComposerPack = yield this.checkComposeInPack(contentFile, selectProduct.code);
                                const selectItensPack = yield this.checkListPack(contentFile, lineCodeProduct, lineNewpriceProduct);
                                if (selectComposerPack) {
                                    typeProductSelect = selectComposerPack.typeProduct;
                                    const iPSelect = selectComposerPack.composePack;
                                    composePackSelect = iPSelect && iPSelect.length > 0 ? iPSelect : null;
                                    listErrors.push(...selectComposerPack.validadeError);
                                }
                                if (selectItensPack && !selectComposerPack.composePack) {
                                    typeProductSelect = selectItensPack.typeProduct;
                                    const cPSelect = selectItensPack.composePack;
                                    composePackSelect = cPSelect && cPSelect.length > 0 ? cPSelect : null;
                                    listErrors.push(...selectItensPack.validadeError);
                                }
                                // Send Validade 
                                productsValidade.push({
                                    code: selectProduct.code,
                                    name: selectProduct.name,
                                    cost_price: Number(selectProduct.cost_price),
                                    sales_price: Number(selectProduct.sales_price),
                                    new_price: lineNewpriceProduct,
                                    typeProduct: typeProductSelect,
                                    composePack: composePackSelect,
                                    validadeError: listErrors
                                });
                            }
                            else if (Array.isArray(itemProduct) && itemProduct.length == 0) {
                                productsValidade.push(pushError('---', lineCodeProduct, lineNewpriceProduct, ['Produto Não Encontrado']));
                            }
                            else {
                                productsValidade.push(pushError('---', lineCodeProduct, lineNewpriceProduct, ['Falha ao consultar base de dados']));
                            }
                        })));
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_a && !_b && (_c = contentFile_1.return)) yield _c.call(contentFile_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return { errorHeader, productsValidade };
        });
    }
    //Chegar numero de colunas
    checkNumberColumns(line) {
        return line.length !== this.limitColumns;
    }
    // Checar o conteudo da primeira linha do CVS
    checkHeaderLine(line) {
        const validationMessages = [];
        if (this.checkNumberColumns(line)) {
            validationMessages.push(`Cabeçalho inválido, necessário ${this.limitColumns} colunas, essa linha contém (${line.length})`);
        }
        if (line[0].trim() !== 'product_code') {
            validationMessages.push('Cabeçalho product_code não encontrado');
        }
        if (line[1].trim() !== 'new_price') {
            validationMessages.push('Cabeçalho new_price não encontrado');
        }
        // Se não houver mensagens de validação, retorne null
        return validationMessages.length > 0 ? validationMessages : null;
    }
    checkValuesLine(line) {
        const validationMessages = [];
        const code = Number(line[0]);
        const newPrice = Number(line[1]);
        if (this.checkNumberColumns(line)) {
            validationMessages.push(`Linha inválida, necessário ${this.limitColumns} colunas, essa linha contém (${line.length})`);
        }
        if (isNaN(code) || code <= 0) {
            validationMessages.push('Código do produto inválido');
        }
        if (isNaN(newPrice)) {
            validationMessages.push('Novo Preço inválido');
        }
        if (newPrice <= 0) {
            validationMessages.push('Novo Preço não pode negativo');
        }
        return validationMessages.length > 0 ? validationMessages : null;
    }
    checkNewPrice(newPrice, salesPrice, costPrice) {
        const validationMessages = [];
        if (this.checkLowerCostPrice(costPrice, newPrice)) {
            validationMessages.push('Novo preço abaixo do custo (' + costPrice + ')');
        }
        const priceAdjustment = this.checkPriceAdjustment(salesPrice, newPrice);
        if (priceAdjustment) {
            if (priceAdjustment == 'low') {
                validationMessages.push('Preço ultrapassa -10% do preço atual');
            }
            if (priceAdjustment == 'high') {
                validationMessages.push('Preço ultrapassa +10% do preço atual');
            }
        }
        return validationMessages.length > 0 ? validationMessages : null;
    }
    checkLowerCostPrice(costPrice, newPrice) {
        return newPrice <= costPrice;
    }
    checkPriceAdjustment(price, newPrice) {
        const maxAdjustment = Number(price) * 0.10; // 10% do preço atual
        const lowerBound = Number(price) - Number(maxAdjustment);
        const upperBound = Number(price) + Number(maxAdjustment);
        if (newPrice < lowerBound) {
            return 'low';
        }
        else if (newPrice > upperBound) {
            return 'high';
        }
        else {
            return null;
        }
    }
    checkComposeInPack(contentFile, codeProduct) {
        return __awaiter(this, void 0, void 0, function* () {
            const selectComposerPack = yield packRepository.listComposerPack(codeProduct);
            let typeProductSelect = products_1.TypeEnumProduct.UNIQUE;
            let composePackSelect = null;
            const validationMessages = [];
            if (Array.isArray(selectComposerPack) && selectComposerPack.length > 0) {
                typeProductSelect = products_1.TypeEnumProduct.ComposePack;
                const listPack = [];
                selectComposerPack.map(item => {
                    listPack.push({
                        code: Number(item.pack_id)
                    });
                });
                composePackSelect = listPack.length > 0 ? listPack : null;
            }
            //buscar poduto na dentro do arquivo csv
            if (composePackSelect !== null && (composePackSelect === null || composePackSelect === void 0 ? void 0 : composePackSelect.length) > 0) {
                const result = this.searchProductListFile(contentFile, composePackSelect);
                validationMessages.push(...result.validationMsg);
            }
            return { typeProduct: typeProductSelect, composePack: composePackSelect, validadeError: validationMessages };
        });
    }
    checkListPack(contentFile, codeProduct, newPrice) {
        return __awaiter(this, void 0, void 0, function* () {
            const selectItensPack = yield packRepository.listItensPack(codeProduct);
            let typeProductSelect = products_1.TypeEnumProduct.UNIQUE;
            let composePackSelect = null;
            const validationMessages = [];
            if (Array.isArray(selectItensPack) && selectItensPack.length > 0) {
                typeProductSelect = products_1.TypeEnumProduct.PACK;
                const listPack = [];
                selectItensPack.map(item => {
                    listPack.push({
                        code: Number(item.product_id),
                        qty: Number(item.qty)
                    });
                });
                composePackSelect = listPack.length > 0 ? listPack : null;
            }
            //buscar poduto na dentro do arquivo csv
            if (composePackSelect !== null && (composePackSelect === null || composePackSelect === void 0 ? void 0 : composePackSelect.length) > 0) {
                const result = this.searchProductListFile(contentFile, composePackSelect, true);
                validationMessages.push(...result.validationMsg);
                if (newPrice !== result.somaQty) {
                    validationMessages.push('Soma total dos componentes desse kit está inválida');
                }
            }
            return { typeProduct: typeProductSelect, composePack: composePackSelect, validadeError: validationMessages };
        });
    }
    searchProductListFile(contentFile, objectCodeProduct, isPack = false) {
        const validationMessages = [];
        const msgDefault = isPack ? 'É necessário atualizar o(s) produto(s): ' : 'É necessário atualizar a composição do pack: ';
        const listPack = [];
        const existingCodes = contentFile.reduce((acc, item) => {
            const productsFound = objectCodeProduct.find(produto => produto.code === Number(item[0]));
            if (productsFound) {
                const qtyItem = productsFound.qty ? Number(productsFound.qty) : 1;
                const newPrice = Number(item[1]);
                acc.push(Object.assign(Object.assign({}, productsFound), { priceTotal: newPrice * qtyItem }));
            }
            return acc;
        }, []);
        if (existingCodes.length !== objectCodeProduct.length) {
            const listProduct = objectCodeProduct.map(item => {
                return isPack ? `(code:${item.code} qty:${item.qty})` : `(code:${item.code})`;
            });
            validationMessages.push(`${msgDefault} ${listProduct.join(', ')}`);
        }
        // Só somar se nao tiver erros anteriores
        const somaTotal = validationMessages.length == 0 && isPack ?
            existingCodes.reduce((acc, item) => {
                acc += item.priceTotal;
                return acc;
            }, 0) : 0;
        const retrunSoma = somaTotal ? { somaQty: somaTotal } : undefined;
        return Object.assign({ validationMsg: validationMessages, pack: listPack.join(', ') }, retrunSoma);
    }
}
exports.ValidadeProductsCSV = ValidadeProductsCSV;
