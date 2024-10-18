'use client'

import { Suspense, lazy } from 'react';

const Map = lazy(() => import('@/components/map'));
const SwitchInfo = lazy(() => import('@/components/switch-info'));
const Topology = lazy(() => import('@/components/topology'));

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { AggregateFlow, FlowEntry, Node, Switch, SwitchDesc } from '@/types';
import { useCallback, useEffect, useState } from 'react';

export default function Dashboard() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [selectedSwitchData, setSelectedSwitchData] = useState<Switch | null>(null);
  const [selectedSwitchId, setSelectedSwitchId] = useState<number | null>(null);
  const [newFlowEntry, setNewFlowEntry] = useState<string>(JSON.stringify({
    cookie: 1,
    cookie_mask: 1,
    table_id: 0,
    idle_timeout: 30,
    hard_timeout: 30,
    priority: 11111,
    flags: 1,
    match: { in_port: 1 },
    actions: [{ type: "OUTPUT", port: 2 }]
  }, null, 2));

  const fetchNodes = useCallback(async () => {
    try {
      const response = await fetch('/api/location');
      if (response.ok) {
        const data = await response.json();
        setNodes(prevNodes => {
          if (JSON.stringify(prevNodes) !== JSON.stringify(data)) {
            return data;
          }
          return prevNodes;
        });
      }
    } catch (error) {
      console.error('Error fetching nodes:', error);
    }
  }, []);

  const fetchSwitchData = useCallback(async (id: number) => {
    try {
      const [flowResponse, descResponse, aggregateFlowResponse] = await Promise.all([
        fetch(`/api/switch/${id}/flow`),
        fetch(`/api/switch/${id}/desc`),
        fetch(`/api/switch/${id}/aggregateflow`)
      ]);

      const [flowData, descData, aggregateFlowData] = await Promise.all([
        flowResponse.json(),
        descResponse.json(),
        aggregateFlowResponse.json()
      ]);

      const flowTable = Array.isArray(flowData) ? flowData : Object.values(flowData).flat();

      setSelectedSwitchData({
        id,
        flowTable,
        desc: descData[id] as SwitchDesc,
        aggregateFlow: aggregateFlowData[id] as AggregateFlow[]
      });
    } catch (error) {
      console.error('Error fetching switch data:', error);
    }
  }, []);

  useEffect(() => {
    fetchNodes();
    const nodesInterval = setInterval(fetchNodes, 30000);
    return () => clearInterval(nodesInterval);
  }, [fetchNodes]);

  useEffect(() => {
    if (selectedSwitchId !== null) {
      fetchSwitchData(selectedSwitchId);
    }
  }, [selectedSwitchId, fetchSwitchData]);

  const deleteFlowEntry = async (entry: FlowEntry) => {
    try {
      const response = await fetch(`/api/switch/${selectedSwitchId}/flow`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dpid: selectedSwitchId,
          table_id: entry.table_id || 0,
          priority: entry.priority || 1,
          match: entry.match || {},
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete flow entry');
      }

      if (selectedSwitchId !== null) {
        fetchSwitchData(selectedSwitchId);
      }
    } catch (error) {
      console.error('Error deleting flow entry:', error);
    }
  };

  const addFlowEntry = async () => {
    try {
      const response = await fetch(`/api/switch/${selectedSwitchId}/flow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: newFlowEntry,
      });

      if (!response.ok) {
        throw new Error('Failed to add flow entry');
      }

      if (selectedSwitchId !== null) {
        fetchSwitchData(selectedSwitchId);
      }
    } catch (error) {
      console.error('Error adding flow entry:', error);
    }
  };

  return (
    <>
      <main className='w-dvw h-dvh p-2'>
        <ResizablePanelGroup autoSaveId="resizable-panel-group-1" direction="horizontal">
          <ResizablePanel>
            <Suspense fallback={
              <div className='w-full h-full border border-input rounded-lg flex items-center justify-center'>
                Loading Switch Info...
              </div>
            }>
              <SwitchInfo
                selectedSwitchData={selectedSwitchData}
                newFlowEntry={newFlowEntry}
                setNewFlowEntry={setNewFlowEntry}
                addFlowEntry={addFlowEntry}
                deleteFlowEntry={deleteFlowEntry}
              />
            </Suspense>
          </ResizablePanel>
          <ResizableHandle className='bg-transparent p-1' />
          <ResizablePanel>
            <ResizablePanelGroup autoSaveId="resizable-panel-group-2" direction="vertical">
              <ResizablePanel>
                <Suspense fallback={
                  <div className='w-full h-full border border-input rounded-lg flex items-center justify-center'>
                    Loading Topology...
                  </div>
                }>
                  <Topology />
                </Suspense>
              </ResizablePanel>
              <ResizableHandle className='bg-transparent p-1' />
              <ResizablePanel>
                <Suspense fallback={
                  <div className='w-full h-full border border-input rounded-lg flex items-center justify-center'>
                    Loading Map...
                  </div>
                }>
                  <Map
                    nodes={nodes}
                    selectedSwitchId={selectedSwitchId}
                    setSelectedSwitchId={setSelectedSwitchId}
                  />
                </Suspense>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
      <footer className="z-99 fixed bottom-2 right-2 w-[32rem] h-12 bg-background rounded-tl-xl hidden lg:block">
        <div className="absolute bottom-0 -left-8 w-8 h-4 bg-transparent rounded-br-xl shadow-[1rem_0_0_0_theme(colors.background)]"></div>
        <div className="absolute -top-4 right-0 w-8 h-4 bg-transparent rounded-br-xl shadow-[1rem_0_0_0_theme(colors.background)]"></div>
        <div className="absolute bottom-0 right-0 w-[calc(100%-.5rem)] h-[calc(100%-.5rem)] border border-input rounded-lg flex items-center justify-center text-foreground">
          © {new Date().getFullYear()} WISE Lab
        </div>
      </footer>
    </>
  );
}
