import { prisma } from "@/lib/prisma";

export async function GET() {
    const nodes = await prisma.node.findMany();
    return new Response(JSON.stringify(nodes), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function PUT(req: Request) {
    try {
        const { id, rssi, lat, lng } = await req.json();
        const updatedNode = await prisma.node.update({
            where: { id },
            data: {
                ...(rssi !== undefined && { rssi }),
                ...(lat !== undefined && { lat }),
                ...(lng !== undefined && { lng }),
            },
        });
        return new Response(JSON.stringify(updatedNode), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Update node failed' }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
