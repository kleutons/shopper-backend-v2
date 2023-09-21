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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepository = void 0;
const database_1 = require("../../../knex/database");
class ProductRepository {
    constructor() {
        this.table = "products";
    }
    selectProduct(code, unique) {
        const selectTable = (0, database_1.db)(this.table);
        if (!code && unique === undefined) {
            return selectTable.then((dataItem) => {
                return dataItem;
            }).catch((err) => {
                return "Erro ao consultar Banco de dados!";
            });
        }
        else if (!code && unique !== undefined) {
            if (unique) {
                const select = selectTable.whereNotIn('code', (0, database_1.db)('packs').select('pack_id'));
                return select.then((dataItem) => {
                    return dataItem;
                }).catch((err) => {
                    // console.log(err);
                    return "Erro ao consultar Banco de dadoos!";
                });
            }
            else {
                const select = selectTable.whereIn('code', (0, database_1.db)('packs').select('pack_id'));
                return select.then((dataItem) => {
                    return dataItem;
                }).catch((err) => {
                    // console.log(err);
                    return "Erro ao consultar Banco de dados!";
                });
            }
        }
        else 
        // product/code
        if (code && Array.isArray(code)) {
            const select = selectTable.whereIn('code', code);
            return select.then((dataItem) => {
                return dataItem;
            }).catch((err) => {
                // console.log(err);
                return "Erro ao consultar Banco de dados!";
            });
        }
    }
    updateProducts(dataUpdate) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const selectTable = (0, database_1.db)(this.table);
            const result = { updateAll: true };
            for (const item of dataUpdate) {
                try {
                    yield selectTable
                        .where('code', item.code)
                        .update({ sales_price: item.sales_price });
                    console.log(`Produto ${item.code} atualizado com sucesso.`);
                }
                catch (err) {
                    console.error(`Erro ao atualizar produto: ${item.code}`, err);
                    result.updateAll = false;
                    (_a = result.error) === null || _a === void 0 ? void 0 : _a.push(`Erro ao atualizar produto: ${item.code}`);
                }
            }
            return result;
        });
    }
}
exports.ProductRepository = ProductRepository;
