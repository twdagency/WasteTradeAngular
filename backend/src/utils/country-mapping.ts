/**
 * Country name to ISO code mapping utility
 * Imported from frontend country data for consistency
 */

const countryNameToIsoMap: Record<string, string> = {
    andorra: 'AD',
    'united arab emirates': 'AE',
    afghanistan: 'AF',
    'antigua and barbuda': 'AG',
    anguilla: 'AI',
    albania: 'AL',
    armenia: 'AM',
    'netherlands antilles': 'AN',
    angola: 'AO',
    antarctica: 'AQ',
    argentina: 'AR',
    'american samoa': 'AS',
    austria: 'AT',
    australia: 'AU',
    aruba: 'AW',
    azerbaijan: 'AZ',
    'bosnia and herzegovina': 'BA',
    barbados: 'BB',
    bangladesh: 'BD',
    belgium: 'BE',
    'burkina faso': 'BF',
    bulgaria: 'BG',
    bahrain: 'BH',
    burundi: 'BI',
    benin: 'BJ',
    'saint barthelemy': 'BL',
    bermuda: 'BM',
    brunei: 'BN',
    bolivia: 'BO',
    brazil: 'BR',
    bahamas: 'BS',
    bhutan: 'BT',
    botswana: 'BW',
    belarus: 'BY',
    belize: 'BZ',
    canada: 'CA',
    'cocos islands': 'CC',
    'democratic republic of the congo': 'CD',
    'central african republic': 'CF',
    'republic of the congo': 'CG',
    switzerland: 'CH',
    'ivory coast': 'CI',
    'cook islands': 'CK',
    chile: 'CL',
    cameroon: 'CM',
    china: 'CN',
    colombia: 'CO',
    'costa rica': 'CR',
    cuba: 'CU',
    'cape verde': 'CV',
    curacao: 'CW',
    'christmas island': 'CX',
    cyprus: 'CY',
    'czech republic': 'CZ',
    germany: 'DE',
    djibouti: 'DJ',
    denmark: 'DK',
    dominica: 'DM',
    'dominican republic': 'DO',
    algeria: 'DZ',
    ecuador: 'EC',
    estonia: 'EE',
    egypt: 'EG',
    'western sahara': 'EH',
    eritrea: 'ER',
    spain: 'ES',
    ethiopia: 'ET',
    finland: 'FI',
    fiji: 'FJ',
    'falkland islands': 'FK',
    micronesia: 'FM',
    'faroe islands': 'FO',
    france: 'FR',
    gabon: 'GA',
    'united kingdom': 'GB',
    grenada: 'GD',
    georgia: 'GE',
    ghana: 'GH',
    gibraltar: 'GI',
    greenland: 'GL',
    gambia: 'GM',
    guinea: 'GN',
    'equatorial guinea': 'GQ',
    greece: 'GR',
    guatemala: 'GT',
    guam: 'GU',
    'guinea-bissau': 'GW',
    guyana: 'GY',
    'hong kong': 'HK',
    honduras: 'HN',
    croatia: 'HR',
    haiti: 'HT',
    hungary: 'HU',
    indonesia: 'ID',
    ireland: 'IE',
    israel: 'IL',
    india: 'IN',
    'british indian ocean territory': 'IO',
    iraq: 'IQ',
    iran: 'IR',
    iceland: 'IS',
    italy: 'IT',
    jamaica: 'JM',
    jordan: 'JO',
    japan: 'JP',
    kenya: 'KE',
    kyrgyzstan: 'KG',
    cambodia: 'KH',
    kiribati: 'KI',
    comoros: 'KM',
    'saint kitts and nevis': 'KN',
    'north korea': 'KP',
    'south korea': 'KR',
    kuwait: 'KW',
    'cayman islands': 'KY',
    kazakhstan: 'KZ',
    laos: 'LA',
    lebanon: 'LB',
    'saint lucia': 'LC',
    liechtenstein: 'LI',
    'sri lanka': 'LK',
    liberia: 'LR',
    lesotho: 'LS',
    lithuania: 'LT',
    luxembourg: 'LU',
    latvia: 'LV',
    libya: 'LY',
    morocco: 'MA',
    monaco: 'MC',
    moldova: 'MD',
    montenegro: 'ME',
    'saint martin': 'MF',
    madagascar: 'MG',
    'marshall islands': 'MH',
    macedonia: 'MK',
    mali: 'ML',
    myanmar: 'MM',
    mongolia: 'MN',
    macau: 'MO',
    'northern mariana islands': 'MP',
    mauritania: 'MR',
    montserrat: 'MS',
    malta: 'MT',
    mauritius: 'MU',
    maldives: 'MV',
    malawi: 'MW',
    mexico: 'MX',
    malaysia: 'MY',
    mozambique: 'MZ',
    namibia: 'NA',
    'new caledonia': 'NC',
    niger: 'NE',
    nigeria: 'NG',
    nicaragua: 'NI',
    netherlands: 'NL',
    norway: 'NO',
    nepal: 'NP',
    nauru: 'NR',
    niue: 'NU',
    'new zealand': 'NZ',
    oman: 'OM',
    panama: 'PA',
    peru: 'PE',
    'french polynesia': 'PF',
    'papua new guinea': 'PG',
    philippines: 'PH',
    pakistan: 'PK',
    poland: 'PL',
    'saint pierre and miquelon': 'PM',
    pitcairn: 'PN',
    'puerto rico': 'PR',
    palestine: 'PS',
    portugal: 'PT',
    palau: 'PW',
    paraguay: 'PY',
    qatar: 'QA',
    reunion: 'RE',
    romania: 'RO',
    serbia: 'RS',
    russia: 'RU',
    rwanda: 'RW',
    'saudi arabia': 'SA',
    'solomon islands': 'SB',
    seychelles: 'SC',
    sudan: 'SD',
    sweden: 'SE',
    singapore: 'SG',
    'saint helena': 'SH',
    slovenia: 'SI',
    'svalbard and jan mayen': 'SJ',
    slovakia: 'SK',
    'sierra leone': 'SL',
    'san marino': 'SM',
    senegal: 'SN',
    somalia: 'SO',
    suriname: 'SR',
    'south sudan': 'SS',
    'sao tome and principe': 'ST',
    'el salvador': 'SV',
    'sint maarten': 'SX',
    syria: 'SY',
    swaziland: 'SZ',
    'turks and caicos islands': 'TC',
    chad: 'TD',
    togo: 'TG',
    thailand: 'TH',
    tajikistan: 'TJ',
    tokelau: 'TK',
    'east timor': 'TL',
    turkmenistan: 'TM',
    tunisia: 'TN',
    tonga: 'TO',
    turkey: 'TR',
    'trinidad and tobago': 'TT',
    tuvalu: 'TV',
    taiwan: 'TW',
    tanzania: 'TZ',
    ukraine: 'UA',
    uganda: 'UG',
    'united states': 'US',
    uruguay: 'UY',
    uzbekistan: 'UZ',
    vatican: 'VA',
    'saint vincent and the grenadines': 'VC',
    venezuela: 'VE',
    'british virgin islands': 'VG',
    'u.s. virgin islands': 'VI',
    vietnam: 'VN',
    vanuatu: 'VU',
    'wallis and futuna': 'WF',
    samoa: 'WS',
    kosovo: 'XK',
    yemen: 'YE',
    mayotte: 'YT',
    'south africa': 'ZA',
    zambia: 'ZM',
    zimbabwe: 'ZW',
};

// Convert country name to ISO code using proper mapping
// Falls back to first 2 letters if not found in mapping
export function getCountryIsoCode(countryName: string): string {
    const normalizedName = countryName.toLowerCase().trim();

    // Try exact match first
    if (countryNameToIsoMap[normalizedName]) {
        return countryNameToIsoMap[normalizedName];
    }

    // Try partial matches - prioritize matches where the country name starts with the search term
    let bestMatch: string | null = null;
    let bestMatchScore = 0;

    for (const [name, isoCode] of Object.entries(countryNameToIsoMap)) {
        // Exact word match in multi-word country names (e.g., "kingdom" matches "united kingdom")
        const nameWords = name.split(/\s+/);
        const searchWords = normalizedName.split(/\s+/);
        
        // Check if all search words are present in the country name
        const allWordsMatch = searchWords.every(searchWord => 
            nameWords.some(nameWord => nameWord.includes(searchWord) || searchWord.includes(nameWord))
        );
        
        if (allWordsMatch) {
            // Calculate match score: higher score for more words matching
            const matchScore = searchWords.length;
            if (matchScore > bestMatchScore) {
                bestMatchScore = matchScore;
                bestMatch = isoCode;
            }
        }
        
        // Fallback: simple substring match
        if (!bestMatch && (name.includes(normalizedName) || normalizedName.includes(name))) {
            bestMatch = isoCode;
        }
    }

    if (bestMatch) {
        return bestMatch;
    }

    // Fallback to first 2 letters uppercase
    return countryName.substring(0, 2).toUpperCase();
}

// Get ALL ISO codes that match a partial search term (e.g., "united" returns ['GB', 'US', 'AE'])
export function getAllMatchingCountryIsoCodes(searchTerm: string): string[] {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    const matches: string[] = [];

    for (const [name, isoCode] of Object.entries(countryNameToIsoMap)) {
        if (name.includes(normalizedSearch)) {
            matches.push(isoCode);
        }
    }

    return matches;
}

// Get all available country mappings
export function getAllCountryMappings(): Record<string, string> {
    return { ...countryNameToIsoMap };
}

// Check if a country name exists in the mapping
export function isValidCountryName(countryName: string): boolean {
    const normalizedName = countryName.toLowerCase().trim();
    return normalizedName in countryNameToIsoMap;
}
