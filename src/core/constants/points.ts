import { WasteType } from './wasteTypes';

export const POINTS_PER_SCAN = 10;

export const POINTS_BY_WASTE_TYPE: Record<WasteType, number> = {
    [WasteType.PLASTIC]: 10,
    [WasteType.GLASS]: 15,
    [WasteType.PAPER]: 8,
    [WasteType.ORGANIC]: 5,
    [WasteType.METAL]: 20,
};

export const DUPLICATE_SCAN_WINDOW_HOURS = 24;
