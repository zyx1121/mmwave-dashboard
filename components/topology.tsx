'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Network, Data, Options } from 'vis-network/standalone';
import { isEqual, debounce } from 'lodash';
import { Link, Host } from '@/types';

const Topology: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [network, setNetwork] = useState<Network | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedFetchData = useCallback(
    debounce(async () => {
      const currentTime = Date.now();
      if (currentTime - lastUpdateTime < 5000) {
        return;
      }

      try {
        const [linksResponse, hostsResponse] = await Promise.all([
          fetch('/api/topology/links'),
          fetch('/api/topology/hosts')
        ]);

        if (!linksResponse.ok || !hostsResponse.ok) {
          throw new Error(`HTTP error! status: ${linksResponse.status} or ${hostsResponse.status}`);
        }

        const [newLinks, newHosts] = await Promise.all([
          linksResponse.json(),
          hostsResponse.json()
        ]);

        setLinks(prevLinks => isEqual(prevLinks, newLinks) ? prevLinks : newLinks);
        setHosts(prevHosts => isEqual(prevHosts, newHosts) ? prevHosts : newHosts);
        setLastUpdateTime(currentTime);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching topology data:', error);
        setError('Error fetching data');
        setIsLoading(false);
      }
    }, 1000),
    [lastUpdateTime, setLinks, setHosts, setLastUpdateTime, setIsLoading, setError]
  );

  useEffect(() => {
    const fetchDataAndScheduleNext = () => {
      debouncedFetchData();
      fetchTimeoutRef.current = setTimeout(fetchDataAndScheduleNext, 5000);
    };

    fetchDataAndScheduleNext();

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      debouncedFetchData.cancel();
    };
  }, [debouncedFetchData]);

  useEffect(() => {
    if (links.length === 0 && hosts.length === 0) {
      console.log('No available topology data');
      return;
    }

    console.log('Rendering topology with:', links.length, 'links and', hosts.length, 'hosts');
    console.log('Links data:', links);
    console.log('Hosts data:', hosts);

    const nodes = new Set<string>();
    const edges: { from: string; to: string; label: string; arrows?: string }[] = [];

    links.forEach(link => {
      nodes.add(link.src.dpid);
      nodes.add(link.dst.dpid);
      edges.push({
        from: link.src.dpid,
        to: link.dst.dpid,
        label: `${link.src.name}\n${link.dst.name}`,
        arrows: 'to'
      });
    });

    hosts.forEach((host, index) => {
      const hostId = `host_${index}`;
      nodes.add(hostId);
      edges.push({
        from: hostId,
        to: host.port.dpid,
        label: host.port.name
      });
    });

    const data: Data = {
      nodes: Array.from(nodes).map(node => {
        if (node.startsWith('host_')) {
          const hostIndex = parseInt(node.split('_')[1]);
          const host = hosts[hostIndex];
          return {
            id: node,
            label: host.ipv4[0],
            shape: 'box',
            color: {
              background: '#FFA500',
              border: '#FF8C00'
            }
          };
        } else {
          return {
            id: node,
            label: node.slice(-4),
            title: node,
            shape: 'circle',
            color: {
              background: 'lightblue',
              border: '#2B7CE9'
            }
          };
        }
      }),
      edges: edges
    };

    const options: Options = {
      nodes: {
        size: 30,
        font: {
          size: 12,
          color: '#000000'
        },
        borderWidth: 2
      },
      edges: {
        width: 2,
        font: {
          size: 10
        },
        arrows: {
          to: {
            enabled: true,
            scaleFactor: 0.5
          }
        }
      }
    };

    if (containerRef.current) {
      if (network) {
        network.setData(data);
      } else {
        const newNetwork = new Network(containerRef.current, data, options);
        setNetwork(newNetwork);
      }
    }
  }, [links, hosts, network]);

  if (isLoading) {
    return <div className='w-full h-full border border-input rounded-lg flex items-center justify-center'>
      Loading Topology...
    </div>;
  }

  if (error) {
    return <div className='w-full h-full border border-input rounded-lg flex items-center justify-center'>
      Error: {error}
    </div>;
  }

  if (links.length === 0 && hosts.length === 0) {
    return <div className='w-full h-full border border-input rounded-lg flex items-center justify-center'>
      No available topology data
    </div>;
  }

  return (
    <div ref={containerRef} className="h-full w-full border border-input rounded-xl" />
  );
};

export default Topology;
