import { NextResponse } from 'next/server';
import { fetchRestAreas } from '../../../src/services/trafikverketService';

export async function GET() {
  try {
    const data = await fetchRestAreas();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: 'Kunde inte hämta rastplatser' }, { status: 500 });
  }
}