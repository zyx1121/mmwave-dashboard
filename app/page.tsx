'use client'

import Topology from '@/components/topology';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GoogleMap, LoadScript, OverlayView } from '@react-google-maps/api'
import { useEffect, useState, useCallback } from 'react';

// Define the Node type
interface Node {
  id: string;
  rssi: number;
  lat: number;
  lng: number;
}

interface FlowEntry {
  priority: number;
  match: {
    in_port?: number;
    eth_type?: number;
    ipv4_src?: string;
    ipv4_dst?: string;
  };
  actions: string[];
}

interface SwitchDesc {
  mfr_desc: string;
  hw_desc: string;
  sw_desc: string;
  serial_num: string;
  dp_desc: string;
}

interface Switch {
  id: number;
  flowTable: FlowEntry[];
  desc?: SwitchDesc;
}

function formatFlowEntry(entry: any): string {
  const priority = entry.priority || '未知';
  const match = entry.match ? Object.entries(entry.match)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ') : '無匹配條件';
  const actions = Array.isArray(entry.actions) ? entry.actions.join(', ') : '無動作';
  return `優先級: ${priority}, 匹配: ${match}, 動作: ${actions}`;
}

export default function Dashboard() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [switches, setSwitches] = useState<Switch[]>([]);

  const fetchNodes = async () => {
    try {
      const response = await fetch('/api/node');
      if (response.ok) {
        const data = await response.json();
        setNodes(data);
      }
    } catch (error) {
      console.error('Error fetching nodes:', error);
    }
  };

  const fetchSwitches = useCallback(async () => {
    try {
      const response = await fetch('/api/topology/switches');
      if (response.ok) {
        const switchIds = await response.json();
        console.log('交換機 IDs:', switchIds);

        const switchesWithData = await Promise.all(
          switchIds.map(async (id: number) => {
            const flowResponse = await fetch(`/api/topology/flow/${id}`);
            const flowData = await flowResponse.json();
            console.log(`交換機 ${id} 的流表:`, flowData);

            const descResponse = await fetch(`/api/topology/desc/${id}`);
            const descData = await descResponse.json();
            console.log(`交換機 ${id} 的描述:`, descData);

            const flowTable = typeof flowData === 'object' && flowData !== null
              ? Object.values(flowData).flat()
              : (Array.isArray(flowData) ? flowData : []);

            return { 
              id, 
              flowTable,
              desc: descData[id] as SwitchDesc
            };
          })
        );
        setSwitches(switchesWithData);
      }
    } catch (error) {
      console.error('錯誤：獲取交換機資訊失敗：', error);
    }
  }, []);

  useEffect(() => {
    fetchNodes();
    fetchSwitches();
    const interval = setInterval(fetchSwitches, 5000); // 每5秒更新一次
    return () => clearInterval(interval);
  }, [fetchSwitches]);

  return (
    <>
      <main className='w-dvw h-dvh p-4 flex gap-4'>
        <aside className="w-1/3 flex flex-col gap-4">
          <div className="w-full h-1/3 border border-input rounded-xl">
            <Topology />
          </div>
          <ScrollArea className="w-full h-2/3 border border-input rounded-xl p-4">
            {switches.map((sw) => (
              <div key={sw.id} className="mb-6">
                <h3 className="text-lg font-semibold mb-2">交換機 {sw.id}</h3>
                {sw.desc && (
                  <div className="mb-2 text-sm">
                    <p>製造商: {sw.desc.mfr_desc}</p>
                    <p>硬件: {sw.desc.hw_desc}</p>
                    <p>軟件: {sw.desc.sw_desc}</p>
                    <p>序列號: {sw.desc.serial_num}</p>
                    <p>數據平面描述: {sw.desc.dp_desc}</p>
                  </div>
                )}
                {Array.isArray(sw.flowTable) && sw.flowTable.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {sw.flowTable.map((entry, index) => (
                      <li key={index} className="mb-2">
                        {formatFlowEntry(entry)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>此交換機沒有流表條目。(流表長度: {sw.flowTable?.length || 0})</p>
                )}
              </div>
            ))}
          </ScrollArea>
        </aside>
        <section className="w-2/3">
          <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <GoogleMap
              mapContainerStyle={{
                width: '100%',
                height: '100%',
                borderRadius: '1rem',
                border: '1px solid hsl(var(--input))',
              }}
              center={{
                lat: 25.012148367198414,
                lng: 121.54131693029791,
              }}
              options={{
                mapTypeId: 'satellite',
                disableDefaultUI: true,
                tilt: 0,
              }}
              zoom={18}
            >
              {nodes.map((node) => (
                <OverlayView
                  key={node.id}
                  position={{ lat: node.lat, lng: node.lng }}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                >
                  <div className='w-20 h-15 bg-red-500 rounded-xl p-2 border'>
                    <p>ID: {node.id}</p>
                    <p>RSSI: {node.rssi}</p>
                  </div>
                </OverlayView>
              ))}
            </GoogleMap>
          </LoadScript>
        </section>
      </main>
      <footer className="z-99 fixed bottom-4 right-4 w-[32rem] h-12 bg-background rounded-tl-3xl hidden lg:block">
        <div className="absolute bottom-0 -left-8 w-8 h-4 bg-transparent rounded-br-xl shadow-[1rem_0_0_0_theme(colors.background)]"></div>
        <div className="absolute -top-4 right-0 w-8 h-4 bg-transparent rounded-br-xl shadow-[1rem_0_0_0_theme(colors.background)]"></div>
        <div className="absolute bottom-0 right-0 w-[calc(100%-1rem)] h-[calc(100%-1rem)] border border-input rounded-xl flex items-center justify-center text-foreground">
          © {new Date().getFullYear()} WISE Lab
        </div>
      </footer>
    </>
  );
}
