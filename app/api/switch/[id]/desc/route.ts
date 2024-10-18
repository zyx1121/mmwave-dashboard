import { NextResponse } from 'next/server';

export const revalidate = 0;

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const response = await fetch(`http://localhost:8080/stats/desc/${id}`);
    const switchDesc = await response.json();
    return NextResponse.json(switchDesc);
  } catch (error) {
    console.error(`獲取交換機 ${id} 的描述信息失敗:`, error);
    return NextResponse.json({ error: `獲取交換機 ${id} 的描述信息失敗` }, { status: 500 });
  }
}