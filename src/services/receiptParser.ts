import { ParsedReceipt, ReceiptItem } from '../types';

// Modèles de tickets réalistes pour démonstration immédiate et tests complets
const SAMPLE_RECEIPTS: ParsedReceipt[] = [
  {
    merchant: 'Monoprix Gourmet',
    date: new Date().toISOString().split('T')[0],
    items: [
      { id: 'item-1', name: 'Pain de campagne bio', price: 2.80, selected: true, category: 'food' },
      { id: 'item-2', name: 'Café grains Arabica 250g', price: 5.40, selected: true, category: 'food' },
      { id: 'item-3', name: 'Huile d’olive vierge extra', price: 8.90, selected: true, category: 'food' },
      { id: 'item-4', name: 'Chaussettes coton x3', price: 12.00, selected: true, category: 'shopping' },
      { id: 'item-5', name: 'Bouteille jus d’orange frais', price: 3.50, selected: true, category: 'food' },
    ],
  },
  {
    merchant: 'Carrefour Express',
    date: new Date().toISOString().split('T')[0],
    items: [
      { id: 'item-1', name: 'Pâtes Penne Rigate 500g', price: 1.45, selected: true, category: 'food' },
      { id: 'item-2', name: 'Sauce tomate basilic bio', price: 2.30, selected: true, category: 'food' },
      { id: 'item-3', name: 'Parmigiano Reggiano 200g', price: 4.80, selected: true, category: 'food' },
      { id: 'item-4', name: 'Lessive écologique 1.5L', price: 9.90, selected: true, category: 'housing' },
      { id: 'item-5', name: 'Chocolat noir 70%', price: 2.10, selected: true, category: 'food' },
    ],
  },
  {
    merchant: 'Pharmacie Centrale',
    date: new Date().toISOString().split('T')[0],
    items: [
      { id: 'item-1', name: 'Boîte Paracétamol 1g', price: 2.18, selected: true, category: 'other' },
      { id: 'item-2', name: 'Crème hydratante visage', price: 14.50, selected: true, category: 'shopping' },
      { id: 'item-3', name: 'Compléments Vitamine C', price: 8.90, selected: true, category: 'other' },
    ],
  },
];

let sampleIndex = 0;

export async function parseReceiptImage(imageUri?: string): Promise<ParsedReceipt> {
  // Simule une analyse OCR locale ultra-rapide (500ms - 1.2s)
  await new Promise((resolve) => setTimeout(resolve, 800));

  const base = SAMPLE_RECEIPTS[sampleIndex % SAMPLE_RECEIPTS.length];
  sampleIndex++;

  return {
    merchant: base.merchant,
    date: new Date().toISOString().split('T')[0],
    items: base.items.map((it) => ({ ...it, id: `it-${Date.now()}-${Math.random()}` })),
    imageUri,
  };
}
