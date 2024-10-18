import { NextResponse } from 'next/server';

export const revalidate = 0;

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  console.log(`Fetching flow table for switch ${id}`);
  try {
    const response = await fetch(`http://localhost:8080/stats/flow/${id}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-store',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    const flowTable = await response.json();
    return NextResponse.json(flowTable);
  } catch (error) {
    console.error(`Error fetching flow table for switch ${id}:`, error);
    return NextResponse.json({ error: `獲取交換機 ${id} 的流表失敗` }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const body = await request.json();
    console.log(`Deleting flow entry for switch ${id} with data:`, body);

    const response = await fetch('http://localhost:8080/stats/flowentry/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete flow entry: ${response.statusText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting flow entry for switch ${id}:`, error);
    return NextResponse.json({ error: `刪除交換機 ${id} 的流表條目失敗` }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const body = await request.json();
    console.log(`Adding flow entry for switch ${id} with data:`, body);

    const response = await fetch('http://localhost:8080/stats/flowentry/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify({
        ...body,
        dpid: parseInt(id, 10),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add flow entry: ${response.statusText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error adding flow entry for switch ${id}:`, error);
    return NextResponse.json({ error: `新增交換機 ${id} 的流表條目失敗` }, { status: 500 });
  }
}
