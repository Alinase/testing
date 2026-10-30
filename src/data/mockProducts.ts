import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_01',
    name: 'Breakfast Meal 25kg (National Milling)',
    category: 'Staple Food',
    priceZMW: 330.00,
    stock: 45,
    barcode: '6001234567891',
    unit: '25kg bag',
    imageIcon: 'Grain'
  },
  {
    id: 'prod_02',
    name: 'Roller Meal 25kg (Breakfast Milling)',
    category: 'Staple Food',
    priceZMW: 250.00,
    stock: 60,
    barcode: '6001234567892',
    unit: '25kg bag',
    imageIcon: 'Grain'
  },
  {
    id: 'prod_03',
    name: 'White Spoon Sugar 2kg (Zambia Sugar)',
    category: 'Staple Food',
    priceZMW: 68.00,
    stock: 120,
    barcode: '6001234567893',
    unit: '2kg packet',
    imageIcon: 'Package'
  },
  {
    id: 'prod_04',
    name: 'D’lite Cooking Oil 2L (Trade Kings)',
    category: 'Staple Food',
    priceZMW: 95.00,
    stock: 85,
    barcode: '6001234567894',
    unit: '2L bottle',
    imageIcon: 'Droplets'
  },
  {
    id: 'prod_05',
    name: 'Manzi Natural Mineral Water 500ml',
    category: 'Beverages',
    priceZMW: 8.50,
    stock: 240,
    barcode: '6001234567895',
    unit: '500ml bottle',
    imageIcon: 'CupSoda'
  },
  {
    id: 'prod_06',
    name: 'Mosi Premium Lager 375ml',
    category: 'Beverages',
    priceZMW: 26.00,
    stock: 150,
    barcode: '6001234567896',
    unit: '375ml bottle',
    imageIcon: 'Wine'
  },
  {
    id: 'prod_07',
    name: 'Dairibord Steri Milk 500ml',
    category: 'Dairy',
    priceZMW: 22.00,
    stock: 90,
    barcode: '6001234567897',
    unit: '500ml carton',
    imageIcon: 'Milk'
  },
  {
    id: 'prod_08',
    name: 'Boom Detergent Powder 1kg',
    category: 'Household',
    priceZMW: 38.00,
    stock: 110,
    barcode: '6001234567898',
    unit: '1kg bag',
    imageIcon: 'Sparkles'
  },
  {
    id: 'prod_09',
    name: 'Lifebuoy Herbal Soap 175g',
    category: 'Household',
    priceZMW: 18.50,
    stock: 140,
    barcode: '6001234567899',
    unit: 'Bar',
    imageIcon: 'Shield'
  },
  {
    id: 'prod_10',
    name: 'TotalEnergies LPG Gas Refill 6kg',
    category: 'Energy & Power',
    priceZMW: 215.00,
    stock: 25,
    barcode: '6001234567900',
    unit: '6kg cylinder',
    imageIcon: 'Flame'
  },
  {
    id: 'prod_11',
    name: 'Solar Emergency LED Bulb 15W Rechargeable',
    category: 'Energy & Power',
    priceZMW: 125.00,
    stock: 50,
    barcode: '6001234567901',
    unit: 'Piece',
    imageIcon: 'Zap'
  },
  {
    id: 'prod_12',
    name: 'Eveready Heavy Duty AA Batteries (Pack of 4)',
    category: 'Energy & Power',
    priceZMW: 35.00,
    stock: 75,
    barcode: '6001234567902',
    unit: '4-pack',
    imageIcon: 'Battery'
  }
];

export const DEFAULT_USERS = [
  {
    id: 'usr_alinase',
    name: 'Alinase Nyirenda',
    role: 'RESEARCHER' as const,
    affiliation: 'University of Zambia (MA Candidate, NASREC: 2026-JAN: 030)',
    email: 'alinasenyirenda@gmail.com'
  },
  {
    id: 'usr_cashier1',
    name: 'Chileshe Mwape',
    role: 'CASHIER' as const,
    affiliation: 'Lusaka Central Mart (Kalingalinga Branch)',
    email: 'cmwape@lusakamart.zm'
  }
];
