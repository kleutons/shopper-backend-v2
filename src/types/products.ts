export type TypeProduct = {
    code: number;
    name: string;
    cost_price: number;
    sales_price: number;
};

export type TypeContentCSV = {
    code: number;
    new_price: number;
};

export enum TypeEnumProduct {
    UNIQUE = 'unitário',
    PACK = 'pack',
    ComposePack = 'compõe um pack',
};

export type TypeComposePack = {
    code: number;
    qty?: number;
}
export interface TypeComposePackTotal extends TypeComposePack {
    priceTotal: number;
}

export interface TypeProductValidade extends TypeProduct {
    new_price: number;
    typeProduct: TypeEnumProduct;
    composePack:TypeComposePack[] | null;
    validadeError: string[] | null;
}
