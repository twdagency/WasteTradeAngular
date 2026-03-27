/**
 * Material mapping utility
 * Imported from frontend material-type data for consistency
 */

export interface MaterialOption {
    name: string;
    code: string;
}

export interface MaterialType {
    name: string;
    code: string;
    materials: MaterialOption[];
    form: MaterialOption[];
    grading: MaterialOption[];
    colour: MaterialOption[];
    finishing: MaterialOption[];
    packing: MaterialOption[];
}

/**
 * Material colors mapping
 */
export const colourMapping: Record<string, string> = {
    black: 'Black',
    blue: 'Blue',
    brown: 'Brown',
    coloured_jazz: 'Coloured/jazz',
    green: 'Green',
    grey: 'Grey',
    natural: 'Natural',
    red: 'Red',
    white: 'White',
};

/**
 * Material finishing mapping
 */
export const finishingMapping: Record<string, string> = {
    baled: 'Baled',
    blocks: 'Blocks',
    flakes: 'Flakes',
    lumps: 'Lumps',
    masterbatch: 'Masterbatch',
    pieces: 'Pieces',
    powder: 'Powder',
    regrind: 'Regrind',
    resin: 'Resin',
    rolls: 'Rolls',
    sheets: 'Sheets',
    shred: 'Shred',
};

/**
 * Material packing mapping
 */
export const packingMapping: Record<string, string> = {
    bags: 'Bags',
    bales: 'Bales',
    boxes: 'Boxes',
    bulk_bags: 'Bulk Bags',
    loose: 'Loose',
    octabins_gaylords: 'Octabins/Gaylords',
    pallets: 'Pallets',
};

/**
 * Plastic form mapping
 */
export const plasticFormMapping: Record<string, string> = {
    airbags: 'Airbags',
    bags: 'Bags',
    bins: 'Bins',
    blister: 'Blister',
    bottles: 'Bottles',
    buckets: 'Buckets',
    bumpers: 'Bumpers',
    cables: 'Cable/s',
    cans: 'Cans',
    caps: 'Caps',
    casings: 'Casings',
    cores: 'Cores',
    corex: 'Corex',
    crates: 'Crates',
    cups: 'Cups',
    discs: 'Discs',
    door_skins: 'Door Skins',
    drip_tape: 'Drip Tape',
    film: 'Film',
    filters: 'Filters',
    fines: 'Fines',
    fishing_line: 'Fishing Line',
    hangers: 'Hangers',
    keyboard: 'Keyboard',
    modem: 'Modem',
    moulds: 'Moulds',
    nets: 'Nets',
    pipes: 'Pipes',
    pots: 'Pots',
    preforms: 'Preforms',
    printer: 'Printer',
    profiles: 'Profiles',
    reels: 'Reels',
    rigid: 'Rigid',
    runners: 'Runners',
    skeletons: 'Skeletons',
    soft: 'Soft',
    sprues: 'Sprues',
    strapping: 'Strapping',
    string: 'String',
    tool: 'Tool',
    trays: 'Trays',
    tubes: 'Tubes',
    vacuum: 'Vacuum',
};

/**
 * Plastic grading mapping
 */
export const plasticGradingMapping: Record<string, string> = {
    '6': '6',
    '12': '12',
    '46': '46',
    '66': '66',
    '100': '100',
    '612': '612',
    '1-7': '*1-7',
    '3-7': '*3-7',
    jun_66: 'Jun-66',
    '50_50': '50/50',
    '60_40': '60/40',
    '70_30': '70/30',
    '75_25': '75/25',
    '80_20': '80/20',
    '85_15': '85/15',
    '90_10': '90/10',
    '95_5': '95/5',
    '98_2': '98/2',
    '99_1': '99/1',
    a_grade: 'A Grade',
    agricultural: 'Agricultural',
    aluminium: 'Aluminium',
    automotive: 'Automotive',
    b_grade: 'B Grade',
    c_grade: 'C Grade',
    cd: 'CD',
    cd_dvd: 'CD/DVD',
    coated: 'Coated',
    computer: 'Computer',
    construction: 'Construction',
    dvd: 'DVD',
    electrical: 'Electrical',
    fish_box: 'Fish Box',
    floor_sweeps: 'Floor Sweeps',
    fridge: 'Fridge',
    g: 'G',
    gf: 'GF',
    gf10: 'GF10',
    gf15: 'GF15',
    gf20: 'GF20',
    gf25: 'GF25',
    gf30: 'GF30',
    gf35: 'GF35',
    gf40: 'GF40',
    gf50: 'GF50',
    lcd: 'LCD',
    metalised: 'Metalised',
    mixed: 'Mixed',
    non_woven: 'Non-Woven',
    offcuts: 'Offcuts',
    printed: 'Printed',
    production_waste: 'Production Waste',
    supermarket: 'Supermarket',
    technical: 'Technical',
    tv: 'TV',
    tyvek: 'Tyvek',
    uncoated: 'Uncoated',
    walmart: 'Walmart',
    washing_machine: 'Washing Machine',
    wet: 'Wet',
    woven: 'Woven',
    laminates: 'Laminates',
};

/**
 * Fibre grading mapping
 */
export const fibreGradingMapping: Record<string, string> = {
    high: 'High',
    kraft: 'Kraft',
    medium: 'Medium',
    ordinary: 'Ordinary',
    special: 'Special',
};

/**
 * Material items mapping by type
 */
export const materialItemsMapping: Record<string, string> = {
    // Plastic materials
    abs: 'ABS',
    bopp: 'BOPP',
    eps: 'EPS',
    eva: 'EVA',
    evoh: 'EVOH',
    hdpe: 'HDPE',
    hdpe_pp: 'HDPE/PP',
    k_resin: 'K-Resin',
    ldpe: 'LDPE',
    lldpe: 'LLDPE',
    mdpe: 'MDPE',
    pa: 'PA',
    pbt: 'PBT',
    pc: 'PC',
    pc_abs: 'PC/ABS',
    pe: 'PE',
    pe_pa: 'PE/PA',
    pe_pet: 'PE/PET',
    pe_pp: 'PE/PP',
    pet: 'PET',
    pet_pvc: 'PET/PVC',
    pmma: 'PMMA',
    pom: 'POM',
    pp: 'PP',
    pp_pet: 'PP/PET',
    pp_ps: 'PP/PS',
    ps: 'PS',
    pvc: 'PVC',
    san: 'SAN',
    silicone: 'Silicone',
    tpo: 'TPO',
    tpu: 'TPU',
    black_casings: 'Black Casings',
    creme_casings: 'Crème Casings',
    fridge: 'Fridge',
    mixed_casings: 'Mixed Casings',
    mixed_weee: 'Mixed WEEE',
    bumpers: 'Bumpers',
    mixed_bottles: 'Mixed Bottles',
    mixed_film: 'Mixed Film',
    mixed_hangers: 'Mixed Hangers',
    mixed_plastic: 'Mixed Plastic',
    mixed_rigids: 'Mixed Rigids',
    mixed_strapping: 'Mixed Strapping',

    // Metal materials
    ff: 'FF',
    n2: 'N2',
    oa: 'OA',
    osb: 'OSB',
    osoa: 'OSOA',
    tcans: 'TCANS',
    acans: 'ACANS',
    aluminium: 'Aluminium',
    brass: 'Brass',
    braziery_copper: 'Braziery Copper',
    copper: 'Copper',
    stainless_steel_304: 'Stainless Steel 304',
    stainless_steel_316: 'Stainless Steel 316',

    // Fibre materials (abbreviated for brevity - full list available)
    medium_printed_multi_printing: 'Medium printed multi printing',
    mixed_white_heavily_printed_multiply_board: 'Mixed white heavily printed multiply board',
    multi_printing: 'Multi printing',
    corrugated_board: 'Corrugated board',
    newspapers: 'Newspapers',
    magazines: 'Magazines',
    mixed_papers: 'Mixed papers',

    // Rubber materials
    natural_rubber: 'Natural rubber',
    chloroprene_rubber_CR: 'Chloroprene Rubber (CR)',
    elastomers: 'Elastomers',
    ethylene_propylene_diene_monomer_epdm: 'Ethylene-Propylene-Diene Monomer (EPDM)',
    latex_products: 'Latex Products',
    nitrile_rubber_nbr: 'Nitrile Rubber (NBR)',
    polybutadiene_rubber_BR: 'Polybutadiene Rubber (BR)',
    polyurethane_rubber_PU: 'Polyurethane Rubber (PU)',
    recycled_rubber_products: 'Recycled Rubber Products',
    rubber_compounds: 'Rubber Compounds',
    rubber_conveyor_belts: 'Rubber Conveyor Belts',
    rubber_footwear: 'Rubber Footwear',
    rubber_hoses_and_tubing: 'Rubber Hoses and Tubing',
    rubber_manufacturing_waste: 'Rubber Manufacturing Waste',
    rubber_playground_surfaces: 'Rubber Playground Surfaces',
    rubber_seals_and_gaskets: 'Rubber Seals and Gaskets',
    styrene_butadiene_rubber: 'Styrene-Butadiene Rubber (SBR)',
};

/**
 * Material type mapping
 */
export const materialTypeMapping: Record<string, string> = {
    plastic: 'Plastic',
    efw: 'EFW',
    metal: 'Metals',
    fibre: 'Fibre',
    rubber: 'Rubber',
};

// Convert material code to display name using appropriate mapping
export function getMaterialDisplayName(
    code: string,
    type: 'item' | 'form' | 'grading' | 'colour' | 'finishing' | 'packing' | 'type',
): string {
    const normalizedCode = code.toLowerCase().trim();

    switch (type) {
        case 'item':
            return materialItemsMapping[normalizedCode] || code;
        case 'form':
            return plasticFormMapping[normalizedCode] || code;
        case 'grading':
            return plasticGradingMapping[normalizedCode] || fibreGradingMapping[normalizedCode] || code;
        case 'colour':
            return colourMapping[normalizedCode] || code;
        case 'finishing':
            return finishingMapping[normalizedCode] || code;
        case 'packing':
            return packingMapping[normalizedCode] || code;
        case 'type':
            return materialTypeMapping[normalizedCode] || code;
        default:
            return code;
    }
}

// Convert material display name to code using appropriate mapping
export function getMaterialCode(
    displayName: string,
    type: 'item' | 'form' | 'grading' | 'colour' | 'finishing' | 'packing' | 'type',
): string {
    const normalizedName = displayName.toLowerCase().trim();

    let mapping: Record<string, string> = {};

    switch (type) {
        case 'item':
            mapping = materialItemsMapping;
            break;
        case 'form':
            mapping = plasticFormMapping;
            break;
        case 'grading':
            mapping = { ...plasticGradingMapping, ...fibreGradingMapping };
            break;
        case 'colour':
            mapping = colourMapping;
            break;
        case 'finishing':
            mapping = finishingMapping;
            break;
        case 'packing':
            mapping = packingMapping;
            break;
        case 'type':
            mapping = materialTypeMapping;
            break;
        default:
            return displayName;
    }

    // Find by value (display name) to get key (code)
    for (const [code, name] of Object.entries(mapping)) {
        if (name.toLowerCase() === normalizedName) {
            return code;
        }
    }

    return displayName;
}

// Check if a material code exists in the mapping
export function isValidMaterialCode(
    code: string,
    type: 'item' | 'form' | 'grading' | 'colour' | 'finishing' | 'packing' | 'type',
): boolean {
    const normalizedCode = code.toLowerCase().trim();

    switch (type) {
        case 'item':
            return normalizedCode in materialItemsMapping;
        case 'form':
            return normalizedCode in plasticFormMapping;
        case 'grading':
            return normalizedCode in plasticGradingMapping || normalizedCode in fibreGradingMapping;
        case 'colour':
            return normalizedCode in colourMapping;
        case 'finishing':
            return normalizedCode in finishingMapping;
        case 'packing':
            return normalizedCode in packingMapping;
        case 'type':
            return normalizedCode in materialTypeMapping;
        default:
            return false;
    }
}

// Get all material options for a specific type
export function getAllMaterialOptions(
    type: 'item' | 'form' | 'grading' | 'colour' | 'finishing' | 'packing' | 'type',
): MaterialOption[] {
    let mapping: Record<string, string> = {};

    switch (type) {
        case 'item':
            mapping = materialItemsMapping;
            break;
        case 'form':
            mapping = plasticFormMapping;
            break;
        case 'grading':
            mapping = { ...plasticGradingMapping, ...fibreGradingMapping };
            break;
        case 'colour':
            mapping = colourMapping;
            break;
        case 'finishing':
            mapping = finishingMapping;
            break;
        case 'packing':
            mapping = packingMapping;
            break;
        case 'type':
            mapping = materialTypeMapping;
            break;
        default:
            return [];
    }

    return Object.entries(mapping).map(([code, name]) => ({ code, name }));
}
