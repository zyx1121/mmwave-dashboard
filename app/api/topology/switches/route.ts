import { NextResponse } from 'next/server';

export const revalidate = 0;

export async function GET() {
  try {
    const response = await fetch('http://localhost:8080/stats/switches');
    const switches = await response.json();
    return NextResponse.json(switches);
  } catch (error) {
    console.error('Error fetching switches:', error);
    return NextResponse.json({ error: '獲取交換機列表失敗' }, { status: 500 });
  }
}