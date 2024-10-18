import { NextResponse } from 'next/server';

export const revalidate = 0;

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const response = await fetch(`http://localhost:8080/stats/aggregateflow/${id}`);
    const aggregateFlow = await response.json();
    return NextResponse.json(aggregateFlow);
  } catch (error) {
    console.error(`獲取交換機 ${id} 的聚合流量資訊失敗:`, error);
    return NextResponse.json({ error: `獲取交換機 ${id} 的聚合流量資訊失敗` }, { status: 500 });
  }
}