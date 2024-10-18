import { NextResponse } from 'next/server';
import { Host } from '@/types';

export const revalidate = 0;

export async function GET() {
  try {
    const response = await fetch('http://localhost:8080/v1.0/topology/hosts');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const hosts: Host[] = await response.json();
    return NextResponse.json(hosts);
  } catch (error) {
    console.error('Error fetching hosts:', error);
    return NextResponse.json({ error: '獲取主機列表失敗' }, { status: 500 });
  }
}