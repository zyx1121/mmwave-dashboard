import { NextResponse } from 'next/server';
import { Link } from '@/types';

export const revalidate = 0;

export async function GET() {
  try {
    const response = await fetch('http://localhost:8080/v1.0/topology/links');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const links: Link[] = await response.json();
    return NextResponse.json(links);
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json({ error: '獲取鏈路列表失敗' }, { status: 500 });
  }
}