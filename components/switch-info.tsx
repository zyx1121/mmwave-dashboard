import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogTrigger, DialogContent, DialogFooter, DialogClose, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch, FlowEntry } from '@/types';

interface SwitchInfoProps {
    selectedSwitchData: Switch | null;
    newFlowEntry: string;
    setNewFlowEntry: (value: string) => void;
    addFlowEntry: () => void;
    deleteFlowEntry: (entry: FlowEntry) => void;
}

function formatFlowEntry(entry: FlowEntry): string {
    const priority = entry.priority || 'Unknown';
    const match = entry.match ? Object.entries(entry.match).map(([key, value]) => `${key}: ${value}`).join(', ') : 'No match conditions';
    const actions = Array.isArray(entry.actions) ? entry.actions.join(', ') : 'No actions';
    const length = entry.length !== undefined ? `Length: ${entry.length}` : '';
    const duration = entry.duration_sec !== undefined && entry.duration_nsec !== undefined ? `Duration: ${entry.duration_sec}s ${entry.duration_nsec}ns` : '';
    const packetCount = entry.packet_count !== undefined ? `Packet Count: ${entry.packet_count}` : '';
    const byteCount = entry.byte_count !== undefined ? `Byte Count: ${entry.byte_count}` : '';

    return `Priority: ${priority}, Match: ${match}, Actions: ${actions}, Length: ${length}, Duration: ${duration}, Packet Count: ${packetCount}, Byte Count: ${byteCount}`;
}

const SwitchInfo: React.FC<SwitchInfoProps> = ({ selectedSwitchData, newFlowEntry, setNewFlowEntry, addFlowEntry, deleteFlowEntry }) => {
    return (
        <ScrollArea className="w-full h-full border border-input rounded-lg p-4">
            {selectedSwitchData ? (
                <div>
                    <h3 className="text-lg font-semibold mb-2">Switch {selectedSwitchData.id}</h3>
                    {selectedSwitchData.desc && (
                        <div className="mb-2 text-sm">
                            <ul className="list-disc pl-5">
                                <li>Manufacturer: {selectedSwitchData.desc.mfr_desc}</li>
                                <li>Hardware: {selectedSwitchData.desc.hw_desc}</li>
                                <li>Software: {selectedSwitchData.desc.sw_desc}</li>
                                <li>Serial Number: {selectedSwitchData.desc.serial_num}</li>
                                <li>Data Plane Description: {selectedSwitchData.desc.dp_desc}</li>
                            </ul>
                        </div>
                    )}
                    {selectedSwitchData.aggregateFlow && selectedSwitchData.aggregateFlow.length > 0 && (
                        <div className="mb-2 text-sm">
                            <h4 className="font-semibold">Aggregate Flow Information:</h4>
                            <ul className="list-disc pl-5">
                                <li>Packet Count: {selectedSwitchData.aggregateFlow[0].packet_count}</li>
                                <li>Byte Count: {selectedSwitchData.aggregateFlow[0].byte_count}</li>
                                <li>Flow Count: {selectedSwitchData.aggregateFlow[0].flow_count}</li>
                            </ul>
                        </div>
                    )}
                    {Array.isArray(selectedSwitchData.flowTable) && selectedSwitchData.flowTable.length > 0 ? (
                        <div className="mb-2 text-sm">
                            <div className="flex">
                                <h4 className="font-semibold">Flow Table Information:</h4>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <button className="ml-2 text-green-500">ADD</button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogTitle>Add Flow Entry</DialogTitle>
                                        <Textarea
                                            value={newFlowEntry}
                                            onChange={(e) => setNewFlowEntry(e.target.value)}
                                            className="w-full h-[40rem]"
                                        />
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button onClick={addFlowEntry}>新增</Button>
                                            </DialogClose>
                                            <DialogClose asChild>
                                                <Button variant="ghost">取消</Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <ul className="list-disc pl-5">
                                {selectedSwitchData.flowTable.map((entry, index) => (
                                    <li key={index} className="mb-2">
                                        {formatFlowEntry(entry)}
                                        <button
                                            className="ml-2 text-red-500"
                                            onClick={() => deleteFlowEntry(entry)}
                                        >
                                            DEL
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p>This switch currently has no flow table entries. (Flow table length: {selectedSwitchData.flowTable?.length || 0})</p>
                    )}
                </div>
            ) : (
                <p>Click on a node on the map to view switch information.</p>
            )}
        </ScrollArea>
    );
};

export default SwitchInfo;
