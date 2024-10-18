from mininet.cli import CLI
from mininet.net import Mininet
from mininet.node import RemoteController
from mininet.topo import Topo

REMOTE_CONTROLLER_IP = "192.168.68.121"
REMOTE_CONTROLLER_PORT = 6633


class FullyConnectedSwitchesTopo(Topo):
    def build(self, n=4):
        # Create switches
        switches = [self.addSwitch(f"s{i+1}") for i in range(n)]

        # Create hosts and link them to each switch
        for i in range(n):
            host = self.addHost(f"h{i+1}")
            self.addLink(host, switches[i])

        # Link every switch to every other switch
        for i in range(n):
            for j in range(i + 1, n):
                self.addLink(switches[i], switches[j])


if __name__ == "__main__":
    # Create the topology
    topo = FullyConnectedSwitchesTopo(n=4)

    # Create the Mininet instance with a remote controller
    net = Mininet(topo=topo, controller=None)
    net.addController("c0", controller=RemoteController, ip=REMOTE_CONTROLLER_IP, port=REMOTE_CONTROLLER_PORT)

    # Start the network
    net.start()

    # Enter CLI mode
    CLI(net)

    # Stop the network
    net.stop()
