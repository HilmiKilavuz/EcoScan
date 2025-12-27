export enum WasteType {
    PLASTIC = 'PLASTIC',
    GLASS = 'GLASS',
    PAPER = 'PAPER',
    ORGANIC = 'ORGANIC',
    METAL = 'METAL',
}

export interface BinInfo {
    name: string;
    color: string;
    hexColor: string;
}

export const WASTE_TYPE_TO_BIN: Record<WasteType, BinInfo> = {
    [WasteType.PLASTIC]: {
        name: 'Plastik Geri Dönüşüm Kutusu',
        color: 'Sarı',
        hexColor: '#FFD700',
    },
    [WasteType.GLASS]: {
        name: 'Cam Geri Dönüşüm Kutusu',
        color: 'Mavi',
        hexColor: '#4169E1',
    },
    [WasteType.PAPER]: {
        name: 'Kağıt Geri Dönüşüm Kutusu',
        color: 'Yeşil',
        hexColor: '#228B22',
    },
    [WasteType.ORGANIC]: {
        name: 'Organik Atık Kutusu',
        color: 'Kahverengi',
        hexColor: '#8B4513',
    },
    [WasteType.METAL]: {
        name: 'Metal Geri Dönüşüm Kutusu',
        color: 'Gri',
        hexColor: '#808080',
    },
};
