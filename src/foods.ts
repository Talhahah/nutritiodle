// CSV loader — reads daily-foods.csv and returns foods by date.
// Uses Vite's ?raw import to read the CSV file as a string at build time.

import csvText from '../public/daily-foods.csv?raw';

export type NutrientKey = 'fat' | 'sugars' | 'protein';

export type Nutrient = {
  key: NutrientKey;
  label: string;
  value: number;
};

export type Food = {
  brand: string;
  name: string;
  detail: string;
  servings: string;
  servingSize: string;
  calories: number;
  nutrients: Nutrient[];
  photo: string;
};

type Row = {
  date: string;
  slot: number;
  brand: string;
  name: string;
  detail: string;
  servings: string;
  servingSize: string;
  calories: number;
  fat: number;
  sugars: number;
  protein: number;
  photo: string;
};

function parseCsv(text: string): Row[] {
  const rows: Row[] = [];
  const seenHeaders = false;

  // Split into lines and parse simple CSV (handles quoted commas)
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return rows;

  const headers = lines[0].split(',').map((h) => h.trim());

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Simple CSV parser that respects quoted fields
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current);

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = (fields[index] ?? '').trim();
    });

    rows.push({
      date: row.date,
      slot: Number(row.slot) || 1,
      brand: row.brand,
      name: row.name,
      detail: row.detail,
      servings: row.servings,
      servingSize: row.servingSize,
      calories: Number(row.calories) || 0,
      fat: Number(row.fat) || 0,
      sugars: Number(row.sugars) || 0,
      protein: Number(row.protein) || 0,
      photo: row.photo,
    });
  }

  void seenHeaders;
  return rows;
}

function rowsToFoods(rows: Row[]): Food[] {
  return rows
    .sort((a, b) => a.slot - b.slot)
    .map((row) => ({
      brand: row.brand,
      name: row.name,
      detail: row.detail,
      servings: row.servings,
      servingSize: row.servingSize,
      calories: row.calories,
      nutrients: [
        { key: 'fat', label: 'Total Fat', value: row.fat },
        { key: 'sugars', label: 'Total Sugars', value: row.sugars },
        { key: 'protein', label: 'Protein', value: row.protein },
      ],
      photo: row.photo,
    }));
}

export function getFoodsForDate(date: string): Food[] {
  const rows = parseCsv(csvText);
  return rowsToFoods(rows.filter((row) => row.date === date));
}

export function getFoodsForToday(): Food[] {
  const today = new Date().toISOString().slice(0, 10);
  return getFoodsForDate(today);
}

export function getAllDates(): string[] {
  const rows = parseCsv(csvText);
  return [...new Set(rows.map((row) => row.date))].sort();
}
