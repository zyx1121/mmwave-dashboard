'use client'

import React, { useEffect, useRef, useState } from 'react';
import { Network, Data, Options } from 'vis-network/standalone';
import { isEqual } from 'lodash';

interface LinkEndpoint {
  dpid: string;
  port_no: string;
  hw_addr: string;
  name: string;
}

interface Link {
  src: LinkEndpoint;
  dst: LinkEndpoint;
}

interface Host {
  mac: string;
  ipv4: string[];
  ipv6: string[];
  port: {
    dpid: string;
    port_no: string;
    hw_addr: string;
    name: string;
  };
}

const Topology: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [network, setNetwork] = useState<Network | null>(null);

  const fetchData = async () => {
    try {
      const timestamp = Date.now();
      const linksResponse = await fetch(`/api/topology/links?_t=${timestamp}`);
      const hostsResponse = await fetch(`/api/topology/hosts?_t=${timestamp}`);
      
      if (!linksResponse.ok || !hostsResponse.ok) {
        throw new Error(`HTTP error! status: ${linksResponse.status} or ${hostsResponse.status}`);
      }
      
      const newLinks = await linksResponse.json();
      const newHosts = await hostsResponse.json();

      setLinks(prevLinks => isEqual(prevLinks, newLinks) ? prevLinks : newLinks);
      setHosts(prevHosts => isEqual(prevHosts, newHosts) ? prevHosts : newHosts);

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching topology data:', error);
      setError('Error fetching data');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 1000);
    setIntervalId(id);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

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
  }, [links, hosts]);

  if (isLoading) {
    return <div>正在更新...</div>;
  }

  if (error) {
    return <div>錯誤：{error}</div>;
  }

  if (links.length === 0 && hosts.length === 0) {
    return <div>沒有可用的拓撲數據</div>;
  }

  return (
    <div ref={containerRef} className="h-full w-full" />
  );
};

export default Topology;