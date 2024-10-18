import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 0;

export async function GET() {
  try {
    const nodes = await prisma.node.findMany();
    return NextResponse.json(nodes);
  } catch (error) {
    console.error('獲取所有節點位置資訊失敗:', error);
    return NextResponse.json({ error: '獲取所有節點位置資訊失敗' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, rssi, lat, lng } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: '缺少節點 ID' }, { status: 400 });
    }

    const updatedNode = await prisma.node.update({
      where: { id: Number(id) },
      data: {
        ...(rssi !== undefined && { rssi }),
        ...(lat !== undefined && { lat }),
        ...(lng !== undefined && { lng }),
      },
    });
    return NextResponse.json(updatedNode);
  } catch (error) {
    console.error('更新節點位置資訊失敗:', error);
    return NextResponse.json({ error: '更新節點位置資訊失敗' }, { status: 500 });
  }
}