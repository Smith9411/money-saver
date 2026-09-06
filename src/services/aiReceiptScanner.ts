import { CONFIG } from '../constants/config';
import { ParsedReceipt, ReceiptItem, TransactionCategory } from '../types';

let userApiKey = CONFIG.GEMINI_API_KEY;

export function setApiKey(key: string) {
  userApiKey = key.trim();
}

export function getApiKey(): string {
  return userApiKey || CONFIG.GEMINI_API_KEY;
}

export async function parseReceiptWithAI(
  base64Image: string,
  imageUri?: string
): Promise<ParsedReceipt> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  const prompt = `Tu es un assistant expert en comptabilité et lecture de reçus de caisse.
Analyse cette photo de ticket de caisse et extrais les informations sous forme de JSON strict :
{
  "merchant": "Nom de l'enseigne (ex: Carrefour, Monoprix, Boulangerie...)",
  "date": "Date au format YYYY-MM-DD (ou date du jour si non trouvée)",
  "items": [
    {
      "name": "Désignation claire de l'article",
      "price": 3.50,
      "category": "food"
    }
  ],
  "total": 34.50
}
Les catégories possibles pour chaque article sont :
"food" (alimentation, courses, resto), "transport", "shopping", "housing", "leisure", "other".
Assure-toi que chaque prix est un nombre flottant (pas de texte).
Réponds UNIQUEMENT par le JSON pur sans markdown.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Image,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.warn('Gemini API Error:', response.status, errorText);
    throw new Error(`Erreur API (${response.status}) : Vérifiez votre clé d'API.`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('Aucun texte extrait par l’IA.');
  }

  // Nettoyage au cas où des balises markdown sont incluses
  const cleanJson = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(cleanJson);

  const items: ReceiptItem[] = (parsed.items || []).map((it: any, index: number) => ({
    id: `ai-${Date.now()}-${index}`,
    name: String(it.name || 'Article'),
    price: parseFloat(it.price) || 0,
    selected: true,
    category: (it.category as TransactionCategory) || 'food',
  }));

  return {
    merchant: parsed.merchant || 'Commerce',
    date: parsed.date || new Date().toISOString().split('T')[0],
    items: items.length > 0 ? items : [
      {
        id: `fallback-${Date.now()}`,
        name: 'Total du ticket',
        price: parseFloat(parsed.total) || 0,
        selected: true,
        category: 'food',
      },
    ],
    imageUri,
  };
}
