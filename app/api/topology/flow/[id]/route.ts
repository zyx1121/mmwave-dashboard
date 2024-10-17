import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const response = await fetch(`http://localhost:8080/stats/flow/${id}`);
    const flowTable = await response.json();
    return NextResponse.json(flowTable);
  } catch (error) {
    console.error(`Error fetching flow table for switch ${id}:`, error);
    return NextResponse.json({ error: `獲取交換機 ${id} 的流表失敗` }, { status: 500 });
  }
}