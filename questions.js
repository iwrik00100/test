// ═══════════════════════════════════════════════════════════════════════════════
//  MS Unified Support — PCY Question Bank v3
//  Based on Microsoft Learn documentation and field experience
//  Technologies: DNS Server, DNS Client, DHCP Server, DHCP Client,
//                TCP/IP, SMB, DFS, NPS, 802.1x Wired, 802.1x Wireless, VPN
//  Sections: scoping | probing | troubleshooting | datacollection
//  Tiers: l1 (foundational → intermediate) | l2 (advanced → expert)
// ═══════════════════════════════════════════════════════════════════════════════
const QUESTION_BANK = {

// ─────────────────────────────────────────────────────────────────────────────
//  DNS SERVER
// ─────────────────────────────────────────────────────────────────────────────
dns_server: {
  label: "DNS Server", icon: "🖧", category: "Core Networking",
  scoping: {
    l1: [
      "What Windows Server version is the DNS server running on? (2012 R2 / 2016 / 2019 / 2022)",
      "Is the DNS server role installed standalone, or is it co-hosted on a Domain Controller?",
      "Is the zone configuration standalone (file-backed) or Active Directory-Integrated?",
      "How many DNS servers are deployed — are they Primary, Secondary, or AD-integrated replicas?",
      "What is the exact error message or Event ID reported by the DNS Server service?",
      "When did the issue first occur — was there a Windows Update, config change, or infrastructure event?",
      "Is the problem affecting all DNS queries or only specific record types (A, AAAA, MX, PTR, SRV)?",
      "Are all clients affected, or is it zone-specific, site-specific, or client-specific?",
      "Is the DNS Server service currently running? (services.msc or Get-Service DNS)",
      "Are there error events in Event Viewer under Applications and Services Logs > DNS Server?",
      "Is this DNS server also a Global Catalog server? Could GC port 3268/3269 issues affect DNS?",
      "Is the DNS server reachable on port 53 TCP and UDP from affected clients?"
    ],
    l2: [
      "What zone types are hosted — Forward Lookup, Reverse Lookup, Stub, Conditional Forwarder, or Secondary?",
      "For AD-integrated zones: what replication scope is configured — DomainDNSZones, ForestDNSZones, or Legacy (domain partition)?",
      "Are there zone delegation records (NS records) pointing to this server that may be stale or incorrect?",
      "What forwarders are configured — are they conditional or global? Are they reachable on UDP and TCP 53?",
      "Is recursion enabled or disabled? If disabled, is this an authoritative-only server — and are clients querying it for recursive lookups?",
      "Are DNSSEC zones configured — what signing algorithm (RSASHA256/ECDSAP256), key rollover schedule, and trust anchor distribution method are in use?",
      "Are DNS Policies (server-level or zone-level) configured for split-brain, geo-DNS, or application load balancing?",
      "Is Response Rate Limiting (RRL) enabled — could it be throttling legitimate clients that share a source IP (e.g., behind NAT)?",
      "What are the DNS aging and scavenging settings — No-Refresh interval, Refresh interval, and scavenging period? Is automatic scavenging enabled?",
      "Is the DNS server listening on all interfaces or specific IPs only? Could a recent NIC/IP change affect listener binding?",
      "Is DNS debug logging enabled — what log level flags are set and what is the maximum log file size?",
      "Is there a split-brain (split-horizon) DNS configuration — the same zone hosted internally and externally with different records?",
      "Are DNS socket pool and cache locking configured for DNS cache poisoning protection (Windows Server 2008 R2+)?",
      "What is the TTL configuration for dynamic records — is it consistent with the client update and scavenging intervals?",
      "Are there any Windows Firewall or third-party firewall rules blocking DNS port 53 (UDP/TCP) inbound or outbound on the server?"
    ]
  },
  probing: {
    l1: [
      "Run 'nslookup <failing hostname> <DNS server IP>' — share full output including server, address, and any error (Non-existent domain, Timeout, Server failed).",
      "Run 'Resolve-DnsName <hostname> -Server <DNS IP> -Type A' — share PowerShell output.",
      "Run 'Get-Service DNS | Select Name,Status,StartType,ServiceType' — confirm the service is running.",
      "Run 'ipconfig /all' on the DNS server — confirm server's own IP, subnet, gateway, and its own DNS server setting.",
      "Is the issue reproducible from multiple clients or only one — helps confirm if the server is the problem vs. a client-side cache issue?",
      "Run 'Test-NetConnection -ComputerName <DNS IP> -Port 53' from an affected client — is TCP 53 reachable?",
      "Run 'nslookup -type=SOA <zone name> <DNS IP>' — does it return the SOA record correctly?",
      "Has restarting the DNS Server service temporarily restored resolution? 'Restart-Service DNS'",
      "Export DNS Server event log entries from the time window when the issue started — look for Event IDs 4000, 4001, 4004, 4013, 6702."
    ],
    l2: [
      "Run 'dcdiag /test:dns /v /f:C:\\dcdiag_dns.txt' — share the full text file; note all FAIL and WARN entries.",
      "Run 'repadmin /showrepl * /csv > C:\\repadmin_showrepl.csv' — check for replication failures across all DCs.",
      "Run 'dnscmd /enumzones' — share the zone list with ZoneType, ZoneDP, and ReplicationScope for each zone.",
      "Run 'Get-DnsServerZone | Select ZoneName,ZoneType,ReplicationScope,IsDsIntegrated,IsAutoCreated,IsReverseLookupZone,IsDynamicUpdateEnabled' — share full output.",
      "Run 'Get-DnsServerDiagnostics | Format-List *' — share all diagnostic/logging flags.",
      "Enable DNS debug logging: 'dnscmd /config /loglevel 0x8100F331 /logfilepath C:\\dns_debug.log /logfilesize 1000000000' — reproduce — disable: 'dnscmd /config /loglevel 0x0' — share dns_debug.log.",
      "Run 'Get-DnsServerForwarder' — list forwarders; test each: 'Test-NetConnection <forwarder IP> -Port 53'.",
      "Run 'Get-DnsServerRecursion' — what is RecursionAvailable, RecursionTimeout, AdditionalRecursionTimeout?",
      "Run 'Get-DnsServerRootHint' — are root hints present and correct for the 13 root name servers?",
      "Run 'Get-DnsServerStatistics -ZoneName <zone>' — review TotalQueries, TotalResponses, TcpQueries, UdpQueries, RecursionFailures, SecureUpdateFailures.",
      "Run 'Get-DnsServerZoneTransfer -ZoneName <zone>' — confirm zone transfer settings (SecureNotify, TransferToAnyServer).",
      "Run 'Get-DnsServerResourceRecord -ZoneName <zone> -RRType NS' — are NS records current and pointing to live servers?",
      "Run 'Get-DnsServerCache | Select -First 50' — inspect cached records for stale entries.",
      "Run 'Get-DnsServerDnsSecZone -ZoneName <zone>' — review DNSSEC signing state, KSK/ZSK, and rollover status.",
      "Run 'Get-DnsServerPolicy' and 'Get-DnsServerPolicy -ZoneName <zone>' — list all server and zone-level DNS policies."
    ]
  },
  troubleshooting: {
    l1: [
      "Verify DNS Server service is started and set to Automatic: 'Set-Service DNS -StartupType Automatic; Start-Service DNS'",
      "Check zone loading: 'Get-DnsServerZone | Where ZoneType -eq \"Primary\"' — are all expected zones loaded?",
      "Test resolution locally on the DNS server itself — if nslookup works on the server but not from clients, the issue is network or client-side.",
      "Ping and Test-NetConnection the forwarder IPs on port 53 — if unreachable, DNS resolution for external names will fail.",
      "Review Event ID 4013 — DNS is waiting for AD. Cause: AD replication not complete at DNS service start. Resolution: 'net stop dns && net start dns' after AD is healthy.",
      "Flush the DNS server cache: 'Clear-DnsServerCache -Force' — then retry the failing query.",
      "Verify the server is domain-joined with valid credentials: 'nltest /sc_verify:<domain>' and 'klist' — expired Kerberos tickets can prevent AD zone loading.",
      "Check Windows Firewall — confirm port 53 TCP and UDP inbound rules are enabled: 'Get-NetFirewallRule | Where DisplayName -like \"*DNS*\"'"
    ],
    l2: [
      "If AD-integrated zone fails to load (Event 4000/4001): check if the DNS partition exists — 'repadmin /showattr . DC=DomainDNSZones,<domain> /atts:objectClass'.",
      "If zone records are stale due to scavenging: check per-record timestamp vs. No-Refresh interval — 'Get-DnsServerResourceRecord -ZoneName <z> -RRType A | Select HostName,Timestamp' — increase No-Refresh interval or disable scavenging on critical records.",
      "If recursion fails for external names: run 'Resolve-DnsName . -Type NS -Server <DNS IP>' — timeout indicates broken root hints or blocked UDP 53 outbound. Check firewall ACLs and root hints.",
      "If DNSSEC validation fails (SERVFAIL on DNSSEC-signed zone): run 'Resolve-DnsName <zone> -DnssecOk -Server <DNS IP>' and compare with 'Get-DnsServerDnsSecZone' trust anchor state.",
      "If DNS Policy is misdirecting queries: 'Get-DnsServerQueryResolutionPolicy' — verify SubnetList matches the failing client's source IP; use 'dnscmd /enumrecords <zone> @ /type NS' to confirm correct target.",
      "If split-brain divergence causes wrong records for internal clients: compare SOA serial — 'Resolve-DnsName <zone> -Type SOA -Server <internalDNS>' vs '<externalDNS>' — if external serial > internal, zone transfer is stale.",
      "If DNS debug log shows REFUSED (RCODE 5): the server is refusing queries from that source IP — check DNS server's Recursion scope or Query ACLs.",
      "If Response Rate Limiting (RRL) is dropping legitimate queries: 'Get-DnsServerResponseRateLimiting' — review WindowSize, LeakRate, TruncateRate — whitelist internal subnets if needed.",
      "If AD replication is causing inconsistent DNS records across DCs: force replication — 'repadmin /syncall /Adep' — then verify record consistency across all DNS servers.",
      "Use pktmon to capture DNS traffic: 'pktmon filter add -p 53; pktmon start --capture; <reproduce>; pktmon stop; pktmon etl2txt pktmon.etl' — look for RCODE in response packets."
    ]
  },
  datacollection: {
    l1: [
      "Export DNS Server event log: 'wevtutil epl DNS-Server-Service C:\\DNS_Server_Events.evtx'",
      "Run 'ipconfig /all > C:\\dns_server_ipconfig.txt'",
      "Run 'dnscmd /info > C:\\dnscmd_info.txt'",
      "Run 'nslookup <failing name> <DNS IP> > C:\\nslookup_test.txt'",
      "Run 'Get-DnsServerZone | Export-Csv C:\\dns_zones.csv -NoTypeInformation'"
    ],
    l2: [
      "Enable DNS debug logging: 'dnscmd /config /loglevel 0x8100F331 /logfilepath C:\\dns_debug.log /logfilesize 1000000000' — reproduce for 5–10 minutes — disable: 'dnscmd /config /loglevel 0x0'",
      "Run 'dcdiag /test:dns /v /f:C:\\dcdiag_dns.txt'",
      "Run 'repadmin /showrepl * /csv > C:\\repadmin_showrepl.csv'",
      "Capture network trace: 'netsh trace start capture=yes tracefile=C:\\dns_trace.etl maxsize=1024 overwrite=yes' — reproduce — 'netsh trace stop'",
      "Run 'Get-DnsServerStatistics | ConvertTo-Json | Out-File C:\\dns_statistics.json'",
      "Export all zone data: ForEach ($z in (Get-DnsServerZone).ZoneName) { dnscmd /zoneexport $z \"C:\\$z.dns\" }",
      "Run 'Get-DnsServerDiagnostics | Out-File C:\\dns_diagnostics.txt'",
      "Collect System and Application event logs: 'wevtutil epl System C:\\System_Events.evtx'; 'wevtutil epl Application C:\\App_Events.evtx'"
    ]
  }
},

// ─────────────────────────────────────────────────────────────────────────────
//  DNS CLIENT
// ─────────────────────────────────────────────────────────────────────────────
dns_client: {
  label: "DNS Client", icon: "💻", category: "Core Networking",
  scoping: {
    l1: [
      "What Windows version and build number is the affected client running? (winver or Get-ComputerInfo | Select OsName,OsVersion)",
      "Is this issue affecting one client, multiple clients on the same subnet, or clients across multiple sites?",
      "What DNS server IPs are configured on the affected client — assigned via DHCP or statically configured?",
      "Can the client reach the configured DNS server on port 53? (Test-NetConnection <DNS IP> -Port 53)",
      "Is the DNS Client service (Dnscache) running on the affected machine?",
      "Is the client domain-joined, Azure AD joined, Hybrid Azure AD joined, or a standalone workgroup machine?",
      "Are all DNS names failing, or only specific namespaces — internal vs. external, short names vs. FQDNs?",
      "When did the issue begin — Windows Update, GPO change, network reconfiguration, or VPN client installation?",
      "Does flushing the DNS resolver cache resolve the issue temporarily? (ipconfig /flushdns)",
      "Is this a physical machine, Hyper-V VM, Azure VM, or VDI/Citrix session?",
      "Does the issue occur consistently or intermittently — if intermittent, does it correlate with network events (sleep/resume, DHCP lease renewal, VPN connect/disconnect)?"
    ],
    l2: [
      "Is the client using DHCP-assigned DNS (option 6) or statically configured DNS — is the correct DNS server being assigned?",
      "Are DNS suffix search lists configured via Group Policy (Computer or User) or locally via netsh/registry?",
      "Is DNS devolution enabled — what is the DevolutionLevel setting? Could devolution cause short names to resolve to the wrong domain?",
      "Is the client configured to register DNS records — is dynamic update working? Is the record appearing correctly in DNS?",
      "Is DNS over HTTPS (DoH) or DNS over TLS (DoT) configured on this Windows 11 / Server 2022 client?",
      "Are Name Resolution Policy Table (NRPT) rules applied via GPO — do they affect the failing namespace or override the configured DNS server?",
      "If the client is on VPN — are the split-tunnel DNS settings correct? Is the VPN client injecting NRPT rules or overriding the primary DNS server?",
      "Is the DNS resolver cache holding stale negative cache entries (NXDOMAIN) for the failing name?",
      "Are third-party DNS agents, DNS filtering proxies, or endpoint security products intercepting or modifying DNS traffic on port 53?",
      "Is IPv6 active — are AAAA queries failing while A record queries succeed, or vice versa? Is the client preferring IPv6 (RFC 3484)?",
      "Is there a browser-level DoH configuration (Chrome, Edge) that bypasses the Windows DNS resolver entirely?",
      "Is the client behind a captive portal or proxy that intercepts DNS before reaching the configured server?"
    ]
  },
  probing: {
    l1: [
      "Run 'ipconfig /all' — share full output including DNS Servers, Connection-Specific DNS Suffix, DHCP Enabled, and IP address.",
      "Run 'nslookup <failing name>' — note the DNS server queried and the exact response (Timeout, Non-existent domain, Server failed, or wrong address).",
      "Run 'nslookup <failing name> <explicit DNS IP>' — compare results with default DNS server vs. a known-good server.",
      "Run 'ping <failing hostname>' — does it fail at name resolution (could not find host) or at ICMP level (request timed out)?",
      "Run 'ipconfig /flushdns && ipconfig /registerdns' — retry and share results.",
      "Run 'Test-NetConnection -ComputerName <failing name> -Port 80' — does it resolve the name?",
      "Run 'Resolve-DnsName <failing name>' and 'Resolve-DnsName <failing name> -Server 8.8.8.8' — compare outputs.",
      "Is the issue specific to this client? Can another client on the same subnet resolve the same name?"
    ],
    l2: [
      "Run 'Get-DnsClientNrptPolicy' — are NRPT rules routing specific namespaces to different DNS servers or blocking resolution?",
      "Run 'Get-DnsClient | Select InterfaceAlias,ConnectionSpecificSuffix,UseSuffixSearchList,RegisterThisConnectionsAddress,ResolvesNamesUsingLocal'",
      "Run 'Get-DnsClientServerAddress -AddressFamily IPv4' and '-AddressFamily IPv6' — confirm per-interface DNS server assignments.",
      "Run 'Get-DnsClientGlobalSetting' — review SuffixSearchList, UseDevolution, DevolutionLevel, QueryAdapterName.",
      "Run 'Get-DnsClientCache | Where Status -ne \"Success\" | Select Name,Type,Status,TTL | Format-Table' — inspect failed cache entries.",
      "Run 'Get-DnsClientCache | Where Name -eq \"<failing name>\"' — is a stale or negative entry cached?",
      "Capture DNS client ETL trace: 'netsh trace start capture=yes provider=Microsoft-Windows-DNS-Client level=5 keywords=0xFFFFFFFF tracefile=C:\\dns_client.etl' — reproduce — 'netsh trace stop'",
      "Run 'gpresult /h C:\\gpo_report.html' — open report and inspect Computer > Windows Settings > Name Resolution Policy and DNS Client settings.",
      "Run 'Get-NetIPConfiguration -Detailed' — review DNSServer, DNSSuffix, and InterfaceAlias for all adapters.",
      "Run 'Resolve-DnsName <n> -DnsOnly -Type A' and 'Resolve-DnsName <n> -DnsOnly -Type AAAA' — compare IPv4 vs. IPv6 resolution.",
      "Run 'netsh winhttp show proxy' — proxy misconfiguration can affect DNS in browser and WinHTTP contexts.",
      "Run 'Get-DnsClientNrptRule' — list all NRPT rules including their namespace, DNS servers, and DirectAccessDnsServers fields."
    ]
  },
  troubleshooting: {
    l1: [
      "Flush DNS resolver cache and re-register: 'ipconfig /flushdns && ipconfig /registerdns' — retest immediately.",
      "Restart the DNS Client service: 'Restart-Service Dnscache' — if service cannot restart, check dependent services.",
      "Verify configured DNS server IPs are correct: 'Get-DnsClientServerAddress' — compare against expected domain DNS servers.",
      "Test with an explicit public DNS server: 'Resolve-DnsName <name> -Server 8.8.8.8' — if this resolves, internal DNS is the issue.",
      "Restart the network adapter: 'Restart-NetAdapter -Name \"<adapter>\"' — this forces DHCP renewal and refreshes DNS settings.",
      "Run 'gpupdate /force' if domain-joined — refresh Group Policy DNS settings including NRPT and suffix search lists.",
      "Check if DNS Client service start type is Manual (it should be Automatic or Automatic Delayed): 'Set-Service Dnscache -StartupType Automatic'"
    ],
    l2: [
      "If NRPT rules are misdirecting queries: identify the offending rule via 'Get-DnsClientNrptRule' — remove via 'Remove-DnsClientNrptRule -Namespace <n>' or correct via Group Policy.",
      "If DoH is causing resolution failures on Windows 11: disable per-adapter via Settings > Network > DNS Server Assignment — or: 'Set-DnsClientDohServerAddress -ServerAddress <IP> -DohTemplate $null'",
      "If stale negative caching persists: increase or remove the negative cache TTL on the authoritative DNS server (SOA NXTTL / minimum TTL field).",
      "If VPN client is overriding DNS: check VPN client NRPT rules — 'Get-DnsClientNrptRule | Where Source -eq \"DirectAccess\"' — or review VPN client DNS configuration documentation.",
      "If the client is registering wrong DNS records due to multiple NICs: adjust interface metrics — 'Set-NetIPInterface -InterfaceAlias \"<primary>\" -InterfaceMetric 10' — then run 'ipconfig /registerdns'.",
      "If AAAA queries cause failures and IPv6 is not needed: configure 'Prefer IPv4 over IPv6' via registry — HKLM\\SYSTEM\\CurrentControlSet\\Services\\Tcpip6\\Parameters DisabledComponents = 0x20 (prefer IPv4). Requires reboot.",
      "Analyze the DNS client ETL trace: use 'tracerpt C:\\dns_client.etl -o C:\\dns_report.evtx -of EVTX' — look for DNS_QUERY_REQUEST, DNS_QUERY_RESPONSE events and filter on failing name.",
      "If browser DNS is bypassing Windows resolver: disable browser DoH in Group Policy (Chrome: DnsOverHttpsMode = off; Edge: same policy) — or via browser settings."
    ]
  },
  datacollection: {
    l1: [
      "Run 'ipconfig /all > C:\\ipconfig_client.txt'",
      "Run 'nslookup <failing name> > C:\\nslookup_default.txt' and 'nslookup <failing name> <DNS IP> > C:\\nslookup_explicit.txt'",
      "Run 'Get-DnsClientCache | Out-File C:\\dns_cache.txt'",
      "Export Application event log: 'wevtutil epl Application C:\\App_Events.evtx'"
    ],
    l2: [
      "Capture DNS client ETL: 'netsh trace start capture=yes provider=Microsoft-Windows-DNS-Client level=5 tracefile=C:\\dns_client_trace.etl' — reproduce — stop.",
      "Run 'gpresult /h C:\\gpo_dns_report.html'",
      "Run 'Get-DnsClientNrptPolicy | Out-File C:\\nrpt_policy.txt'",
      "Run 'Get-DnsClientGlobalSetting | Out-File C:\\dns_global.txt'",
      "Run 'Get-DnsClientServerAddress | Out-File C:\\dns_server_addresses.txt'",
      "Run 'Get-NetIPConfiguration -Detailed | Out-File C:\\net_ip_config_detailed.txt'",
      "Export System event log: 'wevtutil epl System C:\\System_Events.evtx'"
    ]
  }
},

// ─────────────────────────────────────────────────────────────────────────────
//  DHCP SERVER
// ─────────────────────────────────────────────────────────────────────────────
dhcp_server: {
  label: "DHCP Server", icon: "🗄️", category: "Core Networking",
  scoping: {
    l1: [
      "What Windows Server version is the DHCP server running on?",
      "Is the DHCP Server service running and set to Automatic? (Get-Service DHCPServer | Select Status,StartType)",
      "Is the DHCP server authorized in Active Directory? (Get-DhcpServerInDC)",
      "What is the exact symptom — clients not getting any IP, receiving APIPA (169.254.x.x), receiving a wrong subnet IP, or lease renewal failing?",
      "Which scopes are affected — all scopes or specific subnet(s)?",
      "Is this a standalone DHCP server or is DHCP Failover/HA configured with a partner server?",
      "When did the issue begin — scope modification, address pool exhaustion, server restart, server migration, or a patch cycle?",
      "Are there DHCP-related errors in the System or DHCP Server Operational event logs?",
      "Is the affected scope active and does it have remaining IP addresses available? (Get-DhcpServerv4ScopeStatistics -ScopeId <scope>)",
      "For clients on remote subnets: is a DHCP relay agent (IP Helper address) configured on the router/L3 switch interface for that subnet?"
    ],
    l2: [
      "Is DHCP Failover configured — what mode (Hot Standby or Load Balance) and what is the partner server's current state (Normal, Communication Interrupted, Partner Down)?",
      "Are DHCP Policies configured on the scope — do they filter clients based on Vendor Class, User Class, MAC address prefix, or Relay Agent information?",
      "What DHCP options are configured at scope, server, class, and policy levels? (Options 3 Gateway, 6 DNS, 15 Domain Name, 43 Vendor Specific, 60 Vendor Class ID, 66/67 PXE boot)",
      "Is DHCP audit logging enabled — what do the DhcpSrvLog-<Day>.log files in %windir%\\System32\\dhcp show?",
      "Are there static MAC address reservations that might conflict with dynamic lease assignment for specific clients?",
      "Is the DHCP Jet database backed up regularly — when was the last backup completed, and has the database been compacted (jetcomp) recently?",
      "Are superscopes, multicast scopes (for MADCAP), or DHCPv6 scopes involved in this network segment?",
      "Are Vendor Class (option 60) or User Class (option 77) options required by specific device types — PXE boot clients, VoIP phones, printers?",
      "Is DHCP-DNS dynamic update configured — what naming policy (client FQDN or server-generated), what credentials/service account, and what update behavior (Always update, Update on request)?",
      "Are DHCP conflict detection attempts configured — if so, the server performs ICMP ping before offering an address, which may cause delay on large networks."
    ]
  },
  probing: {
    l1: [
      "Run 'Get-DhcpServerv4Scope | Select ScopeId,Name,State,StartRange,EndRange,SubnetMask,LeaseDuration' — share all scopes.",
      "Run 'Get-DhcpServerv4ScopeStatistics -ScopeId <scope>' — note InUse, Free, Reserved, Pending, and PercentageInUse fields.",
      "Run 'Get-DhcpServerInDC' — confirm this server is listed as authorized.",
      "From an affected client: 'ipconfig /release && ipconfig /renew' — share complete output including error messages.",
      "Review DHCP audit log: C:\\Windows\\System32\\dhcp\\DhcpSrvLog-<Mon>.log — look for ID 10 (NACK), ID 16 (DECLINE), ID 14 (BOOTP), ID 30+ (DNS update events).",
      "Run 'Get-Service DHCPServer | Select Name,Status,StartType'",
      "Confirm the affected client's ipconfig /all — show DHCP Enabled, DHCP Server, Lease Obtained, and Lease Expires.",
      "Confirm IP Helper address on the router interface: (from router/switch) 'show run interface <int>' — is the DHCP server IP correct?"
    ],
    l2: [
      "Run 'Get-DhcpServerv4Failover | Select Name,Mode,State,PartnerServer,ServerRole,MaxClientLeadTime,AutoStateTransitionInterval,LoadBalancePercent'",
      "Run 'Get-DhcpServerv4Policy -ScopeId <scope>' and 'Get-DhcpServerv4PolicyIPRange -ScopeId <scope> -Name <policy>' — identify if policies are filtering the affected client.",
      "Run 'Get-WinEvent -LogName Microsoft-Windows-Dhcp-Server/Operational | Sort TimeCreated -Descending | Select -First 50 | Format-List TimeCreated,Id,Message'",
      "Run 'Get-DhcpServerv4Lease -ScopeId <scope> | Where AddressState -ne \"Active\"' — find leases in Expired, Released, or Bad-Address state.",
      "Run 'Get-DhcpServerv4Lease -ScopeId <scope> | Sort LeaseExpiryTime | Select -Last 20 | Format-List' — identify recently expired leases that may indicate pool pressure.",
      "Capture DHCP DORA sequence: 'pktmon filter add -p 67; pktmon filter add -p 68; pktmon start --capture' — run 'ipconfig /renew' on client — 'pktmon stop; pktmon etl2txt pktmon.etl'",
      "Run 'Get-DhcpServerv4DnsSetting' — confirm NameProtection, UpdateDnsRRForOlderClients, DynamicUpdates, DisableDnsPtrRRUpdate.",
      "Run 'Get-DhcpServerDatabase' — confirm DatabasePath, BackupPath, RestoreFromBackup, BackupInterval.",
      "Run 'Get-DhcpServerv4OptionValue -ScopeId <scope> | Sort OptionId | Format-List' — share all option values.",
      "Run 'Get-DhcpServerv4Reservation -ScopeId <scope> | Format-List' — list all reservations and confirm no duplicate IPs.",
      "Run 'Get-DhcpServerv4ExclusionRange -ScopeId <scope>' — are the exclusion ranges configured as expected?"
    ]
  },
  troubleshooting: {
    l1: [
      "Verify DHCP service is running: 'Restart-Service DHCPServer' — check Event ID 1046 (unauthorized) or 1063 (authorized) after restart.",
      "If scope is exhausted (PercentageInUse = 100): reduce lease duration, expand scope range, or add an exclusion-free range.",
      "If APIPA on clients: check whether IP Helper on the router is pointing to the correct DHCP server IP — even one transposed digit causes failure.",
      "Confirm scope is in Active state: 'Set-DhcpServerv4Scope -ScopeId <scope> -State Active'",
      "Re-authorize the DHCP server if deauthorized: 'Add-DhcpServerInDC -DnsName <server FQDN> -IPAddress <IP>'",
      "Look for Event ID 1063 (authorized), 1046 (not authorized), or 1055 (unable to contact AD) in System event log.",
      "Check for rogue DHCP servers on the segment — run Wireshark with filter 'bootp.option.dhcp == 2' to detect DHCPOFFER from unexpected servers."
    ],
    l2: [
      "If Failover partner is COMMUNICATION INTERRUPTED: force sync — 'Invoke-DhcpServerv4FailoverReplication -Name <failover relationship> -Force' — then verify: 'Get-DhcpServerv4Failover'",
      "If Failover partner is in PARTNER DOWN state: initiate manual state transition after confirming partner is truly down — 'Set-DhcpServerv4FailoverScope -ScopeId <scope> -State \"PartnerDown\"'",
      "If DHCP database is corrupt (Event 1014, 1016): stop DHCP — 'Stop-Service DHCPServer' — run jetcomp.exe on dhcp.mdb — restart service — if still corrupt, restore from backup.",
      "For DHCP-DNS dynamic update failures (Event 20062, 20063): verify the DNSCredential is valid — 'Get-DhcpServerDnsCredential' — reset if expired.",
      "For DHCP relay not forwarding: confirm UDP 67/68 is not blocked by ACL between relay and DHCP server; confirm 'ip helper-address' is on the correct Layer 3 interface (not sub-interface).",
      "For DHCPv6 scope issues: 'Get-DhcpServerv6Scope' — verify preferred/valid lifetimes; check if stateless (RA + DHCPv6 option only) vs. stateful DHCPv6 is intended.",
      "For policy filtering incorrectly: capture a DHCP DISCOVER with Wireshark — verify Option 60 (VCI) or Option 77 (User Class) value sent by the client matches the policy criteria exactly.",
      "If conflict detection is slowing down lease offers: reduce attempts — 'Set-DhcpServerv4Scope -ScopeId <scope> -ConflictDetectionAttempts 0' — investigate why conflicts exist."
    ]
  },
  datacollection: {
    l1: [
      "Copy DHCP audit logs: 'Copy-Item C:\\Windows\\System32\\dhcp\\DhcpSrvLog-*.log C:\\DHCP_Audit_Logs\\'",
      "Run 'Get-DhcpServerv4Scope | Export-Csv C:\\dhcp_scopes.csv -NoTypeInformation'",
      "Run 'Get-DhcpServerv4ScopeStatistics | Export-Csv C:\\dhcp_scope_stats.csv -NoTypeInformation'",
      "Export DHCP Server Operational log: 'wevtutil epl Microsoft-Windows-Dhcp-Server/Operational C:\\DHCP_Operational.evtx'"
    ],
    l2: [
      "Export full DHCP server config with leases: 'Export-DhcpServer -File C:\\dhcp_full_export.xml -Leases'",
      "Run 'Get-DhcpServerv4Failover | Out-File C:\\dhcp_failover.txt'",
      "Capture DHCP traffic: 'netsh trace start capture=yes tracefile=C:\\dhcp_server_trace.etl' — run ipconfig /renew on affected client — 'netsh trace stop'",
      "Run 'Get-WinEvent -LogName Microsoft-Windows-Dhcp-Server/Operational | Export-Clixml C:\\dhcp_server_events.xml'",
      "Run 'Get-DhcpServerv4DnsSetting | Out-File C:\\dhcp_dns_settings.txt'",
      "Run 'Get-DhcpServerv4Policy | Out-File C:\\dhcp_policies.txt'",
      "Run 'Get-DhcpServerDatabase | Out-File C:\\dhcp_database_config.txt'"
    ]
  }
},

// ─────────────────────────────────────────────────────────────────────────────
//  DHCP CLIENT
// ─────────────────────────────────────────────────────────────────────────────
dhcp_client: {
  label: "DHCP Client", icon: "📡", category: "Core Networking",
  scoping: {
    l1: [
      "What Windows version and build is the affected client running?",
      "What IP address is the client currently showing — APIPA (169.254.x.x), an IP from the wrong scope, or no IP at all?",
      "Is the DHCP Client service (Dhcp) running on the affected machine? (Get-Service Dhcp | Select Status)",
      "Is this a wired Ethernet connection, Wi-Fi connection, or a virtual NIC (Hyper-V/VMware)?",
      "Is the issue intermittent (e.g., fails after wake from sleep) or persistent (never receives an IP)?",
      "Is the client domain-joined — if so, can it authenticate to the domain when it does receive an IP?",
      "Are multiple clients on the same subnet/VLAN affected, or is this one device only?",
      "Was there a recent change that could explain the problem — NIC driver update, OS upgrade, VLAN reassignment, or Hyper-V VM migration?",
      "Does manually assigning a static IP in the same subnet restore full network connectivity — confirming the issue is DHCP-specific?"
    ],
    l2: [
      "Does the client have a DHCP reservation configured by MAC address on the DHCP server — is the reservation in the correct scope?",
      "Is the client sending the expected Vendor Class Identifier (Option 60 / VCI) that DHCP policies filter on?",
      "Is DHCPv6 (IA_NA or IA_PD) being requested alongside DHCPv4 — is the client getting a valid IPv6 address from DHCPv6?",
      "Are UDP ports 67 (server-bound) and 68 (client-bound) blocked by Windows Filtering Platform, Windows Firewall, or a network ACL?",
      "For Hyper-V VMs: is the virtual switch type correct (External) — is MAC address spoofing enabled if needed for load balancing or VMs with multiple NICs?",
      "Is IPv6 SLAAC autoconfiguring an address that interferes with expected DHCPv6 server-assigned addressing?",
      "Is there a third-party network management agent or endpoint security product that takes ownership of the NIC and may suppress DHCP requests?",
      "For post-sleep/hibernate lease renewal failures: is NIC Wake-on-LAN or power management configured to allow the NIC to remain active through power state transitions?"
    ]
  },
  probing: {
    l1: [
      "Run 'ipconfig /all' — share DHCP Enabled (Yes/No), IP Address, DHCP Server, Lease Obtained, and Lease Expires fields.",
      "Run 'ipconfig /release && ipconfig /renew' — share the complete output including any error: 'An error occurred while renewing interface...'",
      "Run 'Get-Service Dhcp | Select Name,Status,StartType,DependentServices'",
      "Run 'Get-NetIPAddress | Select InterfaceAlias,AddressFamily,IPAddress,PrefixOrigin,SuffixOrigin,AddressState'",
      "Try a different physical switchport — does the client receive an IP from a different port?",
      "Run 'arp -a' — are there duplicate IP-to-MAC mappings indicating an IP address conflict?",
      "Restart the network adapter: 'Restart-NetAdapter -Name \"<adapter>\" -Confirm:$false'"
    ],
    l2: [
      "Capture DHCP DORA: 'netsh trace start capture=yes tracefile=C:\\dhcp_client_trace.etl' — run 'ipconfig /renew' — 'netsh trace stop' — share ETL.",
      "Run 'Get-NetAdapter | Select Name,Status,MacAddress,LinkSpeed,DriverVersion,DriverDate,InterfaceDescription'",
      "Run 'Get-NetAdapterPowerManagement | Select Name,AllowComputerToTurnOffDevice,WakeOnMagicPacket,WakeOnPattern'",
      "Check WFP for UDP 67/68 blocks: 'netsh wfp show filters | Select-String -Pattern \"67|68|dhcp\" -Context 2,2'",
      "On the DHCP server: 'Get-DhcpServerv4Lease -ScopeId <scope> | Where ClientId -eq \"<MAC address>\"' — confirm whether a lease exists.",
      "Run 'Get-WinEvent -LogName Microsoft-Windows-Dhcp-Client/Operational | Sort TimeCreated -Descending | Select -First 30 | Format-List TimeCreated,Id,Message'",
      "Run 'Get-NetAdapterBinding -Name \"<adapter>\" | Select DisplayName,ComponentID,Enabled' — confirm DHCP-relevant bindings (IPv4, IPv6) are enabled.",
      "For Hyper-V VMs: 'Get-VMNetworkAdapter -VMName <VM> | Select Name,MacAddress,MacAddressSpoofing,Connected,SwitchName,VlanSetting'"
    ]
  },
  troubleshooting: {
    l1: [
      "Restart DHCP Client service: 'Restart-Service Dhcp' — verify it restarts successfully.",
      "Full release/flush/renew: 'ipconfig /release && ipconfig /flushdns && ipconfig /renew'",
      "Verify the IP Helper address on the router/L3 switch for the client's VLAN points to the correct DHCP server IP.",
      "Update the NIC driver to the latest version from the hardware OEM — driver bugs can cause DHCP failures.",
      "Check for VLAN mismatch on the switchport — confirm the access VLAN matches the DHCP scope's subnet.",
      "Check for rogue DHCP servers: 'Get-DhcpServerInDC' lists authorized servers — capture DHCPOFFER responses with Wireshark to identify unauthorized servers."
    ],
    l2: [
      "If DHCP DISCOVER frames are not reaching the server: use pktmon on the client to confirm DISCOVER is being sent — 'pktmon filter add -p 68; pktmon start --capture; ipconfig /renew; pktmon stop'",
      "If client receives DHCPOFFER but no DHCPREQUEST is sent: check for duplicate IP detection logic in the client — 'Get-NetAdapterAdvancedProperty | Where DisplayName -like \"*ARP*\"'",
      "For Hyper-V VMs: enable MAC spoofing — 'Set-VMNetworkAdapter -VMName <VM> -MacAddressSpoofing On' — if the VM uses NIC teaming or a different MAC than the reservation.",
      "Reset the TCP/IP stack and Winsock: 'netsh int ip reset C:\\ip_reset.log && netsh winsock reset' — requires reboot.",
      "Add Windows Firewall inbound rule if blocking DHCP: 'New-NetFirewallRule -DisplayName \"DHCP Client Allow\" -Direction Inbound -Protocol UDP -LocalPort 68 -RemotePort 67 -Action Allow'",
      "For post-sleep failures: disable NIC power management — 'Set-NetAdapterPowerManagement -Name \"<NIC>\" -WakeOnMagicPacket Disabled -D0PacketCoalescing Disabled' — or via Device Manager > Power Management."
    ]
  },
  datacollection: {
    l1: [
      "Run 'ipconfig /all > C:\\ipconfig_client.txt'",
      "Run 'Get-NetIPConfiguration | Out-File C:\\net_ip_config.txt'",
      "Export DHCP Client Operational log: 'wevtutil epl Microsoft-Windows-Dhcp-Client/Operational C:\\DHCP_Client_Operational.evtx'"
    ],
    l2: [
      "Capture DHCP client trace: 'netsh trace start capture=yes tracefile=C:\\dhcp_client_full.etl' — reproduce — stop.",
      "Run 'Get-NetAdapter | Export-Clixml C:\\net_adapters.xml'",
      "Run 'Get-NetAdapterBinding | Out-File C:\\adapter_bindings.txt'",
      "Run 'Get-WinEvent -LogName Microsoft-Windows-Dhcp-Client/Operational | Export-Clixml C:\\dhcp_client_events.xml'",
      "Run 'Get-NetAdapterPowerManagement | Out-File C:\\nic_power_management.txt'"
    ]
  }
},

// ─────────────────────────────────────────────────────────────────────────────
//  TCP/IP
// ─────────────────────────────────────────────────────────────────────────────
tcpip: {
  label: "TCP/IP", icon: "🌐", category: "Core Networking",
  scoping: {
    l1: [
      "What Windows version and build is the affected machine? (winver or Get-ComputerInfo | Select OsName,OsVersion,OsBuildNumber)",
      "What is the exact symptom — complete loss of connectivity, partial connectivity (some IPs reachable, others not), high latency, packet loss, or intermittent drops?",
      "Is this affecting one machine, multiple machines on the same subnet, or machines across multiple subnets/sites?",
      "Does 'ipconfig /all' show a correctly assigned IP address, subnet mask, and default gateway?",
      "Can the machine ping its loopback address (127.0.0.1) — tests the TCP/IP stack itself?",
      "Can the machine ping its own IP address — tests the NIC and local stack?",
      "Can the machine ping the default gateway IP — tests Layer 2 and Layer 3 local connectivity?",
      "Can the machine ping a remote IP (e.g., 8.8.8.8) without using DNS — tests routing beyond the gateway?",
      "When did the issue start — Windows Update, NIC driver update, network hardware change, or IP reconfiguration?",
      "Is this a physical machine, Hyper-V VM, VMware VM, or Azure/cloud instance? (affects NIC offload and MTU considerations)"
    ],
    l2: [
      "Are there custom TCP/IP registry parameters applied — HKLM\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters (TcpTimedWaitDelay, MaxUserPort, TCPWindowSize, TcpAckFrequency)?",
      "Is Receive Side Scaling (RSS) enabled — are RSS queues properly distributed across CPU cores?",
      "Is Large Send Offload v1/v2 (LSO) enabled — could NIC LSO be causing TCP segmentation issues?",
      "Is TCP Chimney Offload enabled — deprecated in Windows Server 2012+ but may still appear in older systems?",
      "Is IPv6 fully enabled, partially enabled (link-local only), or disabled? Is there a dual-stack issue where IPv6 is preferred but broken?",
      "Are Windows Defender Firewall or IPsec policies blocking specific protocols or ports?",
      "Is Path MTU Discovery (PMTUD) working — are ICMP Type 3 Code 4 (Fragmentation Needed / DF bit set) messages being filtered by a firewall or router in the path?",
      "Are there VPN clients, network filter drivers, or third-party security agents installed that bind to the NIC? (Get-NetAdapterBinding)",
      "What does 'netsh int tcp show global' report for AutoTuningLevel, Chimney, RSS, ECN, and InitialRTT?",
      "Are there routing table issues — 'route print' — conflicting static routes, missing default route, or incorrect route metrics?"
    ]
  },
  probing: {
    l1: [
      "Run 'ping 127.0.0.1' (loopback), 'ping <own IP>', 'ping <default gateway>', 'ping 8.8.8.8' — share results for each, noting RTT and packet loss.",
      "Run 'tracert 8.8.8.8' or 'tracert <failing destination IP>' — share full hop-by-hop output.",
      "Run 'ipconfig /all' — confirm IP, subnet mask, gateway, DNS, and DHCP lease details.",
      "Run 'route print' — share complete IPv4 and IPv6 routing tables.",
      "Run 'netstat -ano | findstr ESTABLISHED' — are expected connections present?",
      "Run 'Get-NetFirewallProfile | Select Name,Enabled,DefaultInboundAction,DefaultOutboundAction'",
      "Run 'pathping <destination>' — provides per-hop latency and packet loss percentages over 250 probes."
    ],
    l2: [
      "Run 'netsh int tcp show global' — share all TCP global settings: AutoTuningLevel, EcnCapability, Timestamps, InitialRTT, ScalingHeuristics.",
      "Run 'Get-NetAdapterAdvancedProperty -Name \"<NIC>\" | Select DisplayName,DisplayValue' — share all offload, RSS, and interrupt moderation settings.",
      "Capture network trace: 'netsh trace start capture=yes tracefile=C:\\tcpip_trace.etl maxsize=512 overwrite=yes' — reproduce — 'netsh trace stop'",
      "Run 'Get-NetAdapterStatistics -Name \"<NIC>\" | Select Name,ReceivedUnicastPackets,OutboundDiscardedPackets,InboundDiscardedPackets,ReceivedPacketErrors,OutboundPacketErrors'",
      "Run 'Get-NetRoute | Select DestinationPrefix,NextHop,RouteMetric,InterfaceAlias,Protocol,State'",
      "Run 'netsh wfp show state file=C:\\wfp_state.xml' — analyze active Windows Filtering Platform filters.",
      "Run 'Get-NetIPAddress | Select InterfaceAlias,AddressFamily,IPAddress,PrefixLength,AddressState,ValidLifetime,PreferredLifetime'",
      "Run 'Get-NetAdapter | Select Name,Status,LinkSpeed,DriverVersion,DriverDate,InterfaceDescription,MtuSize'",
      "Run 'Get-NetAdapterRss | Select Name,Enabled,NumberOfReceiveQueues,BaseProcessorNumber,MaxProcessors'",
      "Test MTU: 'ping <destination> -f -l 1472' — if response is 'Packet needs to be fragmented but DF set', MTU is below 1500. Reduce size to find the path MTU."
    ]
  },
  troubleshooting: {
    l1: [
      "Reset IP configuration and Winsock: 'netsh int ip reset C:\\ip_reset.log && netsh winsock reset' — restart the machine.",
      "Temporarily disable Windows Firewall to isolate: 'Set-NetFirewallProfile -All -Enabled False' — test — re-enable immediately after: 'Set-NetFirewallProfile -All -Enabled True'",
      "Reinstall the NIC driver from the OEM website — do not rely on Windows Update drivers for server NICs.",
      "If default gateway is unreachable: check physical cable, switchport state, VLAN assignment, and switch MAC address table.",
      "Test for MTU issue: 'ping 8.8.8.8 -f -l 1472' — if it fails but '-l 1200' works, an intermediate device is fragmenting or blocking large packets.",
      "Check for multiple default routes with equal metric: 'route print | findstr /C:\"0.0.0.0\"' — remove conflicting routes."
    ],
    l2: [
      "If TCP throughput is poor: 'netsh int tcp set global autotuninglevel=normal' — disable experimental tuning if set; retest with iperf3.",
      "If LSO is causing packet corruption or TCP retransmissions: 'Disable-NetAdapterLso -Name \"<NIC>\" -IPv4 -IPv6' — retest; monitor NIC stats for error reduction.",
      "For MTU/PMTUD blackhole: set the interface MTU: 'netsh int ipv4 set subinterface \"<NIC>\" mtu=1400 store=persistent' — retest and adjust upward to find the actual path MTU.",
      "For asymmetric routing (traffic exits one NIC, returns via another): add specific host routes — 'route add <remote IP> mask 255.255.255.255 <correct gateway> metric 1 if <ifIndex>'",
      "For IPsec SA mismatches blocking traffic: 'Get-NetIPsecMainModeSA | Remove-NetIPsecMainModeSA' — flush stale SAs and allow re-negotiation.",
      "For WFP callout driver blocking (third-party AV/security): 'netsh wfp show filters' — identify vendor GUID — disable callout driver via 'Disable-NetAdapterBinding -Name \"<NIC>\" -ComponentID <ID>' — test — re-enable.",
      "For RSS queue imbalance or CPU affinity issues: 'Set-NetAdapterRss -Name \"<NIC>\" -NumberOfReceiveQueues 4 -BaseProcessorNumber 0' — spread load.",
      "Analyze the netsh trace ETL: use 'pktmon etl2txt tcpip_trace.etl' or Microsoft Network Monitor — look for TCP RST (flag 0x04), retransmissions, or zero-window (Win=0) patterns indicating flow control issues."
    ]
  },
  datacollection: {
    l1: [
      "Run 'ipconfig /all > C:\\ipconfig_all.txt'",
      "Run 'route print > C:\\route_print.txt'",
      "Run 'netstat -ano > C:\\netstat_all.txt'",
      "Export System event log: 'wevtutil epl System C:\\System_Events.evtx'"
    ],
    l2: [
      "Capture network trace: 'netsh trace start capture=yes tracefile=C:\\tcpip_full.etl maxsize=512' — reproduce — stop.",
      "Run 'Get-NetAdapterStatistics | Export-Csv C:\\nic_statistics.csv -NoTypeInformation'",
      "Run 'netsh int tcp show global > C:\\tcp_global_settings.txt'",
      "Run 'netsh wfp show state file=C:\\wfp_filters.xml'",
      "Run 'Get-NetAdapterAdvancedProperty | Out-File C:\\nic_advanced_properties.txt'",
      "Run 'Get-NetRoute | Export-Csv C:\\routing_table.csv -NoTypeInformation'",
      "Collect kernel memory dump for tcpip.sys bugchecks: configure via 'sysdm.cpl > Advanced > Startup and Recovery > Kernel memory dump'."
    ]
  }
},

// ─────────────────────────────────────────────────────────────────────────────
//  SMB
// ─────────────────────────────────────────────────────────────────────────────
smb: {
  label: "SMB", icon: "📂", category: "Core Networking",
  scoping: {
    l1: [
      "What Windows versions are on both the SMB client and the file server?",
      "What is the exact error — Access Denied (0x5), Network Path Not Found (0x35), Network Name No Longer Available, or slow performance?",
      "Are UNC paths (\\\\server\\share) failing, or is it a mapped drive (net use Z: \\\\server\\share)?",
      "Is this affecting all shares on the server or only specific shares?",
      "Is this affecting all clients or specific clients, subnets, or user accounts?",
      "What SMB version is negotiated between this client and server? (Get-SmbConnection | Select ServerName,Dialect)",
      "When did the issue start — security patch (especially SMB-related), GPO change, server migration, or antivirus update?",
      "Are there errors in the SMBClient Connectivity, SMBClient Security, or SMBServer Operational event logs?",
      "Is Kerberos or NTLM authentication in use — is the file server domain-joined?",
      "Is this access over LAN (same site), WAN, or VPN? What is the measured RTT between client and server?"
    ],
    l2: [
      "Is SMB Signing required on the server ('RequireSecuritySignature') and/or client ('RequireSecuritySignature') — could a signing mismatch cause negotiation failure?",
      "Is SMB Encryption enabled server-wide or per-share — does the client support AES-128-CCM, AES-128-GCM, or AES-256-GCM as required by the server's 'EncryptionCiphers' setting?",
      "Are DFS Namespaces layered on top of the shares — could the DFS referral be pointing to the wrong target server, causing an access failure?",
      "Is antivirus or EDR (endpoint detection and response) performing real-time file scanning on the file server, causing handle lock contention or latency?",
      "What are the full SMB server and client configurations? (Get-SmbServerConfiguration, Get-SmbClientConfiguration)",
      "Is SMB Multichannel active — are multiple NICs being used for parallel SMB connections? (Get-SmbMultichannelConnection)",
      "Are there SMB Bandwidth Limit rules configured per share or globally? (Get-SmbBandwidthLimit)",
      "Is Opportunistic Locking (OpLock) or SMB Lease caching behavior causing file corruption for specific applications (e.g., database files accessed via SMB)?",
      "Are there open file handle conflicts on the server preventing access? (Get-SmbOpenFile)",
      "Is this an NTFS permission issue, a Share ACL issue, or an interaction between both layers — or a Kerberos PAC/token issue for large group memberships?"
    ]
  },
  probing: {
    l1: [
      "Run 'net use \\\\<server>\\<share>' on the affected client — share the exact error code and message.",
      "Run 'Test-NetConnection -ComputerName <server> -Port 445' — is TCP 445 reachable?",
      "Run 'Get-SmbConnection | Select ServerName,ShareName,Dialect,Signing,Encrypted,UserName' — are active sessions present?",
      "On the server: 'Get-SmbSession | Where ClientComputerName -eq \"<client IP>\" | Format-List'",
      "Try accessing by IP instead of hostname: '\\\\<server IP>\\<share>' — isolates DNS from SMB auth.",
      "Review SMBClient Connectivity event log: 'Get-WinEvent -LogName Microsoft-Windows-SMBClient/Connectivity | Select -First 20 | Format-List'",
      "Run 'Get-SmbShare -Name \"<share>\" | Format-List' on the server — confirm share exists and path is valid.",
      "Run 'Get-NetFirewallRule | Where DisplayName -like \"*File and Printer*\" | Select DisplayName,Enabled,Direction,Action'"
    ],
    l2: [
      "Run 'Get-SmbServerConfiguration | Select *' — share RequireSecuritySignature, EnableSMB1Protocol, EnableSMB2Protocol, EncryptData, RejectUnencryptedAccess, EncryptionCiphers.",
      "Run 'Get-SmbClientConfiguration | Select *' — share RequireSecuritySignature, EnableBandwidthThrottling, EnableLargeMtu, EnableMultiChannel.",
      "Run 'Get-SmbMultichannelConnection | Select ServerName,ClientInterfaceIndex,ServerInterfaceIndex,State,Throughput,Latency'",
      "Capture simultaneous network traces on client and server: 'netsh trace start capture=yes provider=Microsoft-Windows-SMBClient tracefile=C:\\smb_client.etl' and on server with 'provider=Microsoft-Windows-SMBServer'.",
      "Run 'Get-SmbOpenFile | Where ClientComputerName -eq \"<client IP>\" | Select FileId,SessionId,ClientComputerName,Path,Locks'",
      "Run 'Get-SmbBandwidthLimit | Format-List'",
      "Inspect SMB dialect negotiation and auth in packet trace — look for STATUS_ACCESS_DENIED (0xC0000022), STATUS_LOGON_FAILURE (0xC000006D), STATUS_BAD_NETWORK_NAME (0xC00000CC), STATUS_NETWORK_NAME_DELETED (0xC00000C9).",
      "Run 'whoami /all' on the affected client — note all SID values in the security token.",
      "On the server: 'icacls \"<share path>\"' — show NTFS permissions; 'Get-SmbShareAccess -Name \"<share>\"' — show share permissions.",
      "Run 'Get-SmbServerNetworkInterface | Select InterfaceIndex,RSS,RDMA,Speed,IPAddress'"
    ]
  },
  troubleshooting: {
    l1: [
      "Verify TCP 445 is reachable from client: 'Test-NetConnection -ComputerName <server> -Port 445'",
      "Confirm share exists: 'Get-SmbShare -Name \"<share>\"' — check path, description, and status.",
      "For Access Denied: minimum Share ACL 'Everyone: Read' — apply fine-grained permissions via NTFS ACL on the underlying folder.",
      "Confirm SMB1 is disabled (security hardening): 'Set-SmbServerConfiguration -EnableSMB1Protocol $false -Force' — unless legacy clients explicitly require it.",
      "Restart the Server service on the file server: 'Restart-Service LanmanServer' — resolves some session state issues.",
      "Flush Kerberos tickets on the client: 'klist purge' — retest access — often resolves 'Access Denied' after password or group membership changes."
    ],
    l2: [
      "For SMB Signing mismatch (STATUS_ACCESS_DENIED due to signing policy): align server/client signing — 'Set-SmbServerConfiguration -RequireSecuritySignature $true' on both, or disable requirement for testing.",
      "For SMB Encryption cipher mismatch: check 'Get-SmbServerConfiguration | Select EncryptionCiphers' vs. client OS capabilities — Windows 10/2019+ support AES-128-GCM; older clients only AES-128-CCM.",
      "For Multichannel not negotiating: verify both NICs have valid routes to each other — 'Get-SmbMultichannelConnection -IncludeNotSelected' — ensure NICs are not on the same subnet.",
      "For OpLock/Lease issues causing application-level corruption: 'Set-SmbShare -Name \"<share>\" -CachingMode None' — disables client-side caching — test with the application.",
      "For stale sessions blocking file access: 'Close-SmbSession -Force -SessionId (Get-SmbSession | Where ClientComputerName -eq \"<IP>\").SessionId'",
      "For SMB Encryption failures with RejectUnencryptedAccess: confirm client OS supports AES-256-GCM (Windows 11/2022+); downgrade cipher to AES-128-CCM if legacy clients must connect.",
      "Analyze SMB packet trace: filter on 'smb2' in Wireshark — examine SessionSetup exchange (Kerberos/NTLM blob), TreeConnect response, and IOCTL/Create response error codes.",
      "For AV handle locks causing latency: add the file server share path to the AV exclusion list — test with real-time protection temporarily disabled on the server."
    ]
  },
  datacollection: {
    l1: [
      "Export SMBClient Connectivity log: 'wevtutil epl Microsoft-Windows-SMBClient/Connectivity C:\\SMBClient_Conn.evtx'",
      "Run 'Get-SmbConnection | Out-File C:\\smb_connections.txt'",
      "Run 'Get-SmbShare | Out-File C:\\smb_shares.txt'",
      "Run 'Get-SmbSession | Out-File C:\\smb_sessions.txt'"
    ],
    l2: [
      "Capture client SMB trace: 'netsh trace start capture=yes provider=Microsoft-Windows-SMBClient tracefile=C:\\smb_client.etl' — reproduce — stop.",
      "Capture server SMB trace: same on server with 'provider=Microsoft-Windows-SMBServer tracefile=C:\\smb_server.etl'",
      "Run 'Get-SmbServerConfiguration | Out-File C:\\smb_server_config.txt'",
      "Run 'Get-SmbClientConfiguration | Out-File C:\\smb_client_config.txt'",
      "Run 'Get-SmbMultichannelConnection | Out-File C:\\smb_multichannel.txt'",
      "Run 'Get-WinEvent -LogName Microsoft-Windows-SmbServer/Operational | Export-Clixml C:\\smb_server_events.xml'",
      "Run 'Get-WinEvent -LogName Microsoft-Windows-SMBClient/Security | Export-Clixml C:\\smb_client_security_events.xml'"
    ]
  }
},

// ─────────────────────────────────────────────────────────────────────────────
//  DFS
// ─────────────────────────────────────────────────────────────────────────────
dfs: {
  label: "DFS", icon: "🗃️", category: "Core Networking",
  scoping: {
    l1: [
      "Is this a DFS Namespace (DFSN / DFS-N) issue, a DFS Replication (DFSR / DFS-R) issue, or both?",
      "What Windows Server version are the DFS namespace servers and replication members running?",
      "Is the namespace domain-based (\\\\domain.com\\namespace) or standalone (\\\\server\\namespace)?",
      "What is the exact symptom — namespace root inaccessible, wrong folder target returned (wrong site), replication backlog growing, data mismatch, or SYSVOL replication failure?",
      "Is the issue affecting all clients or only specific clients, sites, or subnets?",
      "Are the DFS Namespace service (Dfs) and DFS Replication service (DFSR) running on affected servers?",
      "When did the issue start — DC promotion or demotion, namespace server decommission, AD replication failure, or network outage?",
      "Are there errors in the DFS Namespace or DFS Replication event logs?",
      "Is this the SYSVOL namespace used for Group Policy and logon scripts (\\\\domain\\SYSVOL or \\\\domain\\NETLOGON)?"
    ],
    l2: [
      "What DFS Replication topology is configured — hub-and-spoke, full mesh, or a custom multi-tier topology?",
      "What are the replication group schedule (bandwidth window), bandwidth throttling setting, and connection interval?",
      "What is the current replication backlog count between affected members? (dfsrdiag backlog)",
      "Is the DFS staging area nearing its quota limit on any member — what is the StagingSizeInMb vs. CurrentStageSizeInMb?",
      "Are files accumulating in the ConflictAndDeleted or PreExisting folders on any replication member?",
      "Is Active Directory replication healthy across all DCs — domain-based DFS namespace objects are stored in the domain partition?",
      "Are locked files (held open by applications or AV) preventing DFSR from staging or installing replicated changes?",
      "Is DFS referral ordering configured for lowest-cost (site cost) or random order? Is client site assignment correct?",
      "Is DFSR SYSVOL migration fully completed from FRS to DFSR on all DCs? (DFSRMIG /getglobalstate)"
    ]
  },
  probing: {
    l1: [
      "Run 'dfsutil /root:\\\\<domain>\\<namespace> /siteinfo' — share namespace root targets and site affinity information.",
      "Run 'Get-DfsnRoot | Select Path,State,Type,TimeToLive' — confirm root state.",
      "Run 'Get-DfsnFolder -Path \\\\<domain>\\<namespace>\\* | Select Path,State,TimeToLive'",
      "Run 'dfsdiag /testreferral /dfspath:\\\\<domain>\\<namespace>\\<folder> /full' — share complete referral diagnostics.",
      "Run 'Get-Service Dfs,DFSR | Select Name,Status,StartType'",
      "From an affected client: 'dfsutil /pktinfo' — share the cached DFS referral packet table.",
      "Review DFS Replication event log: 'Get-WinEvent -LogName \"DFS Replication\" | Sort TimeCreated -Descending | Select -First 30 | Format-List'"
    ],
    l2: [
      "Run 'dfsrdiag replicationstate /member:<server>' for each replication member and share output.",
      "Run 'dfsrdiag backlog /sendingmember:<A> /receivingmember:<B> /rgname:<replication group> /rfname:<replicated folder>' — share backlog count.",
      "Run 'Get-DfsrMembership | Select GroupName,ComputerName,Enabled,State,ContentPath,ReadOnly'",
      "Run 'Get-DfsrConnection | Select GroupName,SourceComputerName,DestinationComputerName,State,Enabled,RdcEnabled,LastSuccessfulSync'",
      "Run 'Get-DfsrMembership | Select ComputerName,FolderName,StagingPath,StagingSizeInMb,CurrentStageSizeInMb,ConflictSizeInMb'",
      "Run 'repadmin /showrepl' and 'dcdiag /test:replications' — confirm AD replication is healthy.",
      "Run 'Get-DfsnServerConfiguration -Path \\\\<server>\\<namespace>' — review namespace server settings.",
      "Run 'Get-DfsrIdRecord -ReferenceObject \"<file path>\" -ReferencePathType FullPath' — trace replication identity of a specific file.",
      "Run 'dfsrdiag syncnow /partner:<partner server> /rgname:<group> /rfname:<folder> /time:1' — force an immediate sync and observe state change.",
      "Run 'DFSRMIG /getmigrationstate' — confirm SYSVOL migration state on all DCs.",
      "Check DFSR debug logs on affected members: C:\\Windows\\debug\\dfsr*.log — filter for ERROR or WARNING events."
    ]
  },
  troubleshooting: {
    l1: [
      "Start DFS services if stopped: 'Start-Service Dfs,DFSR'",
      "For namespace root inaccessible: confirm namespace servers are reachable on TCP 445 and the Dfs service is running.",
      "For wrong folder target (wrong site): 'dfsutil /pktinfo' on client — confirm site is being resolved correctly; check that the client's site assignment in AD Sites and Services is correct.",
      "For DFSR SYSVOL issues: 'dfsrdiag pollad /member:<server>' — forces DFSR to re-read its configuration from AD.",
      "Confirm AD replication is healthy: 'repadmin /showrepl' — DFSR cannot sync if AD replication is broken.",
      "Confirm namespace root folder share exists: 'Get-SmbShare | Where Name -eq \"<namespace>\"'"
    ],
    l2: [
      "For growing staging area: increase quota — 'Set-DfsrMembership -GroupName <g> -FolderName <f> -ComputerName <m> -StagingPathQuotaInMB 16384 -Force' — monitor staging usage.",
      "For DFSR member in IN ERROR state: perform non-authoritative restore — stop DFSR, set registry 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\DFSR\\Parameters\\SysVols\\Seeding SysVol\\<vol>\\Sysvol Subscription\\DirectoryToSubscribeTo = D2' — restart DFSR.",
      "For frequent conflict files: identify the last writer using 'Get-DfsrIdRecord' and review ConflictAndDeleted\\ConflictAndDeletedManifest.xml on affected members.",
      "For stale namespace targets: 'Remove-DfsnFolderTarget -Path <path> -TargetPath <old target>' and 'New-DfsnFolderTarget -Path <path> -TargetPath <new target> -State Online'",
      "For DFS referral ordering: 'Set-DfsnFolder -Path <path> -ReferralPriorityClass sitecost-high' — ensure clients prefer local site targets.",
      "For SYSVOL DFSR migration completing: run 'DFSRMIG /setglobalstate 3' (Eliminated) on PDC emulator — then 'DFSRMIG /getmigrationstate' to confirm all DCs are in state 3.",
      "For AD partition DFS objects corruption: use ADSIEdit — CN=Dfs-Configuration,CN=System,DC=<domain> — look for orphaned or duplicate DfsRoot objects.",
      "Analyze DFSR debug log with DFSR Diagnostic Tool or grep for 'STALE\\|CORRUPT\\|RPC\\|ERROR' in C:\\Windows\\debug\\dfsr*.log — correlate with event log timestamps."
    ]
  },
  datacollection: {
    l1: [
      "Export DFS Replication event log: 'wevtutil epl \"DFS Replication\" C:\\DFSR_Events.evtx'",
      "Run 'Get-DfsrMembership | Out-File C:\\dfsr_membership.txt'",
      "Run 'dfsrdiag replicationstate /member:<each server> >> C:\\dfsr_replication_state.txt'",
      "Run 'Get-DfsnRoot | Out-File C:\\dfsn_roots.txt'"
    ],
    l2: [
      "Collect DFSR debug logs from all members: 'Copy-Item C:\\Windows\\debug\\dfsr*.log C:\\DFSR_Debug_Logs\\'",
      "Run 'dfsrdiag backlog /sendingmember:<A> /receivingmember:<B> /rgname:<g> /rfname:<f> | Out-File C:\\dfsr_backlog.txt'",
      "Run 'Get-DfsrConnection | Out-File C:\\dfsr_connections.txt'",
      "Run 'repadmin /showrepl > C:\\repadmin_showrepl.txt'",
      "Run 'DFSRMIG /getmigrationstate > C:\\dfsrmig_state.txt'",
      "Export DFS Namespace Operational log: 'wevtutil epl Microsoft-Windows-DFSN-Server/Operational C:\\DFSN_Operational.evtx'",
      "Run 'Get-DfsnServerConfiguration | Out-File C:\\dfsn_server_config.txt'"
    ]
  }
},

// ─────────────────────────────────────────────────────────────────────────────
//  NPS (RADIUS)
// ─────────────────────────────────────────────────────────────────────────────
nps: {
  label: "NPS (RADIUS)", icon: "🔐", category: "Authentication",
  scoping: {
    l1: [
      "What Windows Server version is the NPS server running on?",
      "Is the Network Policy Server service (IAS) running and set to Automatic? (Get-Service IAS | Select Status,StartType)",
      "What authentication scenario is this — 802.1x wired, 802.1x wireless, SSTP/IKEv2 VPN, L2TP VPN, or RADIUS proxy authentication?",
      "What is the exact symptom — authentication rejected, no RADIUS response (timeout at NAS), NPS service not responding, or wrong VLAN/attribute assigned?",
      "Is this affecting all users/devices, specific user accounts, specific device types, or a specific RADIUS client (NAS)?",
      "What RADIUS client (NAS) is involved — network switch, wireless access point, or VPN concentrator? What is the NAS device IP address?",
      "Is the RADIUS shared secret configured identically on both NPS and the NAS device — including case sensitivity and special characters?",
      "When did the issue start — NPS certificate renewal, Group Policy change, AD group change, NPS server upgrade, or NAS firmware update?",
      "Are there NPS authentication failure events in the Windows Security event log? (Event IDs 6272 auth succeeded, 6273 auth failed, 6274 discarded)"
    ],
    l2: [
      "What EAP method is configured in the NPS Network Policy — EAP-TLS (certificate-based machine or user auth), PEAP-MSCHAPv2 (username/password), or PEAP-TLS?",
      "Is NPS acting as a standalone RADIUS server, or is it configured as a RADIUS Proxy forwarding requests to a Remote RADIUS Server Group?",
      "Which Connection Request Policy (CRP) and Network Policy (NP) are matching the failing authentication requests — what are their conditions and order?",
      "Is the NPS server computer account a member of 'RAS and IAS Servers' security group in AD (required to read user dial-in properties)?",
      "Is the NPS server TLS certificate trusted by authenticating clients — is the full CA certificate chain present and the root CA certificate distributed to clients via GPO?",
      "Is the authenticating AD account enabled, not locked out, not expired, and does it have the correct dial-in permission (Allow Access, Deny Access, or Control Access through NPS Network Policy)?",
      "Is RADIUS Accounting configured and working — are accounting Start/Stop/Interim packets from the NAS reaching NPS on UDP 1813?",
      "For RADIUS Proxy: are realm routing rules correctly mapping domain suffixes to the correct Remote RADIUS Server Group?",
      "Is the NPS IAS log configured and capturing full authentication detail records? (C:\\Windows\\System32\\LogFiles\\IN*.log — DTS format with all RADIUS attributes)",
      "Are there multiple NPS servers for redundancy — is the NAS device configured with both primary and secondary NPS servers?"
    ]
  },
  probing: {
    l1: [
      "On the NPS server: open Security event log — filter for Event ID 6273 — share the Reason Code (field 9), Reason description, and User-Name.",
      "Run 'Get-Service IAS | Select Name,Status,StartType'",
      "Run 'netsh nps show client' — confirm the NAS device IP is listed as a RADIUS client with the correct shared secret.",
      "Is the user's AD account enabled and not locked? 'Get-ADUser <username> -Properties Enabled,LockedOut,BadLogonCount,AccountExpirationDate | Select *'",
      "What error does the end client/device display — 'Authentication failed', 'Certificate is not valid', 'Server certificate not trusted', or 'Username/password incorrect'?",
      "Review the NPS IAS log: C:\\Windows\\System32\\LogFiles\\IN<date>.log — find the record for the failing User-Name and note the Reason-Code and NAS-IP-Address.",
      "Test RADIUS reachability from the NAS: use 'portqry -n <NPS IP> -e 1812 -p udp' or a RADIUS test tool (e.g., NTRadPing)."
    ],
    l2: [
      "Enable NPS verbose trace: 'netsh nps set tracing mode=all' — reproduce the failure — disable: 'netsh nps set tracing mode=none' — share C:\\Windows\\tracing\\nps.log.",
      "Run 'netsh nps show np' — list all Network Policies, their order, enabled/disabled state, and conditions.",
      "Run 'netsh nps show crp' — list all Connection Request Policies, conditions, and RADIUS server groups.",
      "Verify the NPS server TLS certificate: 'Get-ChildItem Cert:\\LocalMachine\\My | Where Subject -like \"*<NPS FQDN>*\" | Select Subject,Thumbprint,NotAfter,Issuer,EnhancedKeyUsageList'",
      "Verify the CA root cert is in Trusted Root CAs on clients: 'Get-ChildItem Cert:\\LocalMachine\\Root | Where Subject -like \"*<CA name>*\"'",
      "Verify NPS server is in 'RAS and IAS Servers' group: 'Get-ADGroupMember -Identity \"RAS and IAS Servers\" | Where Name -eq \"<NPS server name>\"'",
      "Check CRL accessibility for NPS server cert: 'certutil -verify -urlfetch C:\\nps_server.cer' — does CRL/OCSP check pass?",
      "Capture RADIUS packet trace: 'netsh trace start capture=yes tracefile=C:\\nps_radius.etl' — reproduce — stop — analyze RADIUS Access-Request, Access-Challenge, Access-Accept/Reject on UDP 1812.",
      "Check user dial-in attribute: 'Get-ADUser <user> -Properties msNPAllowDialin | Select msNPAllowDialin' — $null = NPS policy controls; $false = always denied regardless of policy.",
      "For RADIUS proxy: 'netsh nps show remoteserver' — confirm remote RADIUS server IPs and shared secrets; test reachability from NPS proxy to backend NPS on UDP 1812."
    ]
  },
  troubleshooting: {
    l1: [
      "NPS Event 6273 Reason Codes reference: 0=no error, 16=auth method not supported/mismatch, 22=user account not found, 23=password incorrect, 48=no NPS policy matched request, 65=EAP negotiation failure.",
      "Verify RADIUS shared secret is byte-for-byte identical on NPS and the NAS — even a trailing space causes all authentications to fail with RADIUS Message-Authenticator mismatch.",
      "Unlock and confirm AD account: 'Unlock-ADAccount -Identity <user>; Get-ADUser <user> -Properties LockedOut | Select LockedOut'",
      "Verify the NPS Network Policy conditions exactly match the request attributes — check NAS-Port-Type, NAS-IP-Address, Windows Groups, and HCAP conditions.",
      "Restart NPS service: 'Restart-Service IAS' — verify Event ID 4400 (NPS started) appears in System log.",
      "Confirm UDP 1812 reachability from NAS to NPS — check Windows Firewall rule: 'Get-NetFirewallRule | Where DisplayName -like \"*RADIUS*\"'"
    ],
    l2: [
      "For EAP-TLS failure: verify the client cert has Client Authentication EKU (OID 1.3.6.1.5.5.7.3.2), is not expired, has correct SAN/CN, and is issued by a CA that NPS trusts in its Trusted Root CAs store.",
      "For PEAP-MSCHAPv2 failure with incorrect credentials: verify the RADIUS NAS is sending the correct User-Name format (domain\\user or user@domain) and that the account exists in that domain; check if NTLMv2 is required.",
      "For no policy match (Reason 48): check Connection Request Policy first — if the CRP condition does not match, NPS does not even evaluate Network Policies. Review NAS-Port-Type and Called-Station-Id conditions in the CRP.",
      "For RADIUS proxy misrouting: 'netsh nps show remoteserver' — confirm realm suffix routing rules; ensure the RADIUS proxy can resolve and reach backend NPS IPs on UDP 1812.",
      "For expired NPS certificate: re-enroll via 'certlm.msc > Personal > Request new certificate' — then update EAP properties in NPS console (Network Policies > Constraints > Authentication Methods > EAP Types > Properties) to select new certificate.",
      "For msNPAllowDialin = $false: either set to $null (policy-controlled) — 'Set-ADUser <user> -Clear msNPAllowDialin' — or set to $true for explicit allow.",
      "For certificate revocation check failure: if CRL is offline, NPS will reject EAP-TLS by default — temporarily disable revocation checking for testing: NPS EAP Properties > Verify certificate chain (uncheck). This is for testing only.",
      "For RADIUS accounting failures (NAS logs show accounting not recorded): verify UDP 1813 is open on NPS firewall — 'Get-NetFirewallRule | Where LocalPort -eq 1813'",
      "For RADIUS timeout at the NAS: increase RADIUS server timeout on the NAS device — EAP-TLS requires 3-8 round trips (Access-Request → Access-Challenge cycles) — set timeout to minimum 15 seconds.",
      "Analyze the NPS verbose trace (nps.log) — look for 'IAS_AUTH_FAILED', 'IAS_CORRUPT_DATA', or 'IAS_NO_RECORD' entries correlated with the failing user/device."
    ]
  },
  datacollection: {
    l1: [
      "Export Security event log (contains Event 6272/6273): 'wevtutil epl Security C:\\Security_Events.evtx'",
      "Copy NPS IAS log files: 'Copy-Item C:\\Windows\\System32\\LogFiles\\IN*.log C:\\NPS_IAS_Logs\\'",
      "Run 'netsh nps show client > C:\\nps_clients.txt'",
      "Run 'netsh nps show np > C:\\nps_network_policies.txt'"
    ],
    l2: [
      "Enable NPS verbose trace: 'netsh nps set tracing mode=all' — reproduce — disable — collect C:\\Windows\\tracing\\nps.log",
      "Run 'netsh nps show crp > C:\\nps_connection_request_policies.txt'",
      "Run 'Get-ChildItem Cert:\\LocalMachine\\My | Select Subject,Thumbprint,NotAfter,Issuer,EnhancedKeyUsageList | Out-File C:\\nps_certificates.txt'",
      "Capture RADIUS traffic trace: 'netsh trace start capture=yes tracefile=C:\\nps_radius_trace.etl' — reproduce — stop.",
      "Run 'netsh nps show remoteserver > C:\\nps_remote_servers.txt'",
      "Run 'Get-ADGroupMember -Identity \"RAS and IAS Servers\" | Select Name,SamAccountName | Out-File C:\\ras_ias_members.txt'",
      "Run 'Get-ADUser -Filter * -Properties msNPAllowDialin | Where msNPAllowDialin -eq $false | Select Name,SamAccountName | Out-File C:\\users_denied_dialin.txt'"
    ]
  }
},

// ─────────────────────────────────────────────────────────────────────────────
//  802.1x WIRED
// ─────────────────────────────────────────────────────────────────────────────
dot1x_wired: {
  label: "802.1x Wired", icon: "🔌", category: "Authentication",
  scoping: {
    l1: [
      "What Windows version is the authenticating client running?",
      "What is the exact symptom — switchport stuck in unauthorized state (no network), placed in guest/restricted VLAN, wrong VLAN assigned, or intermittent drops?",
      "Is this affecting all ports on the switch, a specific switch, or only specific ports?",
      "What switch vendor, model, and firmware/IOS version is the authenticating switch?",
      "Is the switch configured for 802.1x with NPS (Microsoft RADIUS) as the authentication server?",
      "What host mode is configured on the switch port — single-host, multi-host, multi-auth, or multi-domain (data + voice)?",
      "Is the Wired AutoConfig service (dot3svc) running and set to Automatic on the Windows client? (Get-Service dot3svc | Select Status,StartType)",
      "Is the client using EAP-TLS (machine or user certificate), PEAP-MSCHAPv2 (username/password), or PEAP-TLS?",
      "When did this start — switch firmware update, certificate renewal, GPO change, NPS configuration change, or new client machine?"
    ],
    l2: [
      "What EAP method is configured in the Wired Network (IEEE 802.3) Group Policy — EAP-TLS, PEAP-MSCHAPv2, or a combined method?",
      "Is the Wired Network IEEE 802.3 GPO applied to the affected machine? (gpresult /r | findstr -i '802.3\\|wired')",
      "Is the client machine certificate issued by the correct internal CA, not expired, and present in the LocalMachine\\My certificate store?",
      "Is the NPS Network Policy condition NAS-Port-Type set to Ethernet (value 15) for this wired policy?",
      "Is the switch sending NAS-Port-Type = 15 (Ethernet) in the RADIUS Access-Request — or a different value based on switch vendor configuration?",
      "Is MAC Authentication Bypass (MAB) configured as a fallback for printers, IP phones, or non-802.1x-capable devices?",
      "Is the client machine account a member of the AD security group required by the NPS Network Policy conditions?",
      "What Authentication Order is configured on the switch — dot1x first, then MAB, or MAB first? What are the timeouts?",
      "Is the wired AutoConfig profile deployed as a Computer Configuration GPO (recommended) or User Configuration GPO?"
    ]
  },
  probing: {
    l1: [
      "Run 'Get-Service dot3svc | Select Name,Status,StartType' — is Wired AutoConfig running and set to Automatic?",
      "Run 'gpresult /r | findstr -i \"802.3\\|wired\\|IEEE\"' — is the Wired Network GPO listed in Applied GPOs?",
      "Check Security event log for Event ID 5632 (802.1x authentication request sent) and 5633 (802.1x authentication failed) — share the error code from Event 5633.",
      "On the switch: 'show dot1x interface <interface>' — what is the current authentication state (Authorized/Unauthorized)?",
      "On the switch: 'show authentication sessions interface <interface>' — share the Method, Username, VLAN, and Session-state.",
      "Run 'netsh lan show profiles' — is the correct 802.1x wired profile configured on the client?",
      "Run 'netsh lan show interfaces' — confirm the wired interface is present and in a connected state.",
      "On the NPS server: check Security log for Event 6273 with the Calling-Station-Id matching this client's MAC address."
    ],
    l2: [
      "Run 'netsh lan show profile name=\"<profile>\" | more' — share full EAP type, authentication mode, and certificate selection criteria.",
      "On NPS: filter Security log Event 6273 — note Reason-Code (field 9), Client-IP (NAS IP), Calling-Station-Id (client MAC), and Filter-Id.",
      "Run 'certutil -store My' on the client — confirm the machine certificate subject, thumbprint, expiry, and enhanced key usage (must include Client Authentication OID 1.3.6.1.5.5.7.3.2).",
      "Capture 802.1x wired trace: 'netsh trace start capture=yes provider=Microsoft-Windows-Wired-AutoConfig level=5 tracefile=C:\\wired_8021x.etl' — reproduce — stop.",
      "On the switch (during maintenance): enable 'debug dot1x' and 'debug radius authentication' — capture the full EAP exchange messages.",
      "Run 'Get-WinEvent -LogName Microsoft-Windows-Wired-AutoConfig/Operational | Sort TimeCreated -Descending | Select -First 30 | Format-List'",
      "Verify RADIUS shared secret on NPS for this switch: 'netsh nps show client name=\"<switch name>\"'",
      "Run 'gpresult /h C:\\gpo_report.html' — open and inspect Computer Configuration > Applied GPOs for the Wired Network (IEEE 802.3) policy name.",
      "Run 'certutil -store -enterprise NTAuthCertificates' — is the issuing CA in the NTAuth store (required for Kerberos-based EAP-TLS)?"
    ]
  },
  troubleshooting: {
    l1: [
      "Start and set Wired AutoConfig to Automatic: 'Set-Service dot3svc -StartupType Automatic; Start-Service dot3svc'",
      "Force GPO refresh: 'gpupdate /force /target:computer' — verify with 'netsh lan show profiles'",
      "Verify machine certificate is present, not expired, and from the correct CA: open 'certlm.msc > Personal > Certificates'.",
      "Bounce the switch port during a maintenance window: 'shutdown' then 'no shutdown' — forces a new authentication cycle.",
      "Confirm NPS Network Policy NAS-Port-Type = 15 (Ethernet) matches what the switch sends — check switch configuration for 'dot1x port-type' or 'authentication port-type'.",
      "For PEAP-MSCHAPv2: verify user password is not expired — 'Get-ADUser <user> -Properties PasswordExpired | Select PasswordExpired'"
    ],
    l2: [
      "For EAP-TLS client cert failure: confirm cert has SAN or CN matching the machine FQDN (computer\\<fqdn> or just <fqdn>), Client Authentication EKU, and is in LocalMachine\\My.",
      "For machine account not in required AD group: 'Add-ADGroupMember -Identity \"<group>\" -Members \"<computer>$\"' — machine must reboot to refresh its Kerberos PAC.",
      "For MAB fallback failure: on the switch, verify 'authentication event no-response action authorize vlan <restricted VLAN>' is configured and the MAC is in the RADIUS client database (or switch's local MAC database).",
      "For wired profile not applying via GPO: check GPRESULT — is policy in Denied GPOs? Check WMI filter or security filtering on the GPO object in GPMC.",
      "For VLAN assignment not working: verify NPS Network Policy RADIUS attributes — Tunnel-Type (value 13 = VLAN), Tunnel-Medium-Type (value 6 = 802), Tunnel-Pvt-Group-ID (VLAN ID as a string, not integer).",
      "Analyze wired AutoConfig ETL trace: use Event Viewer or 'tracerpt C:\\wired_8021x.etl -o C:\\wired_report.evtx -of EVTX' — look for EAP method negotiation failure, TLS Alert codes, or RADIUS timeout events.",
      "For multi-domain mode issues on phone + PC same port: confirm switch detects phone via CDP/LLDP — 'show cdp neighbors interface <int>' — and assigns it to the voice VLAN."
    ]
  },
  datacollection: {
    l1: [
      "Run 'netsh lan show profiles > C:\\wired_8021x_profiles.txt'",
      "Run 'netsh lan show interfaces > C:\\wired_interfaces.txt'",
      "Export Security event log: 'wevtutil epl Security C:\\Security_Events_Client.evtx'",
      "Run 'gpresult /h C:\\gpo_report.html'"
    ],
    l2: [
      "Capture wired 802.1x trace: 'netsh trace start capture=yes provider=Microsoft-Windows-Wired-AutoConfig level=5 tracefile=C:\\wired_8021x_trace.etl' — reproduce — stop.",
      "Export Wired-AutoConfig Operational log: 'wevtutil epl Microsoft-Windows-Wired-AutoConfig/Operational C:\\Wired_AutoConfig_Operational.evtx'",
      "Run 'certutil -store My > C:\\machine_cert_store.txt'",
      "Collect NPS configs: 'netsh nps show np > C:\\nps_np.txt'; 'netsh nps show crp > C:\\nps_crp.txt'",
      "Collect switch outputs: 'show dot1x', 'show authentication sessions', 'show radius statistics', 'show running-config interface <int>'",
      "Run 'Get-WinEvent -LogName Microsoft-Windows-Wired-AutoConfig/Operational | Export-Clixml C:\\wired_events.xml'"
    ]
  }
},

// ─────────────────────────────────────────────────────────────────────────────
//  802.1x WIRELESS
// ─────────────────────────────────────────────────────────────────────────────
dot1x_wireless: {
  label: "802.1x Wireless", icon: "📶", category: "Authentication",
  scoping: {
    l1: [
      "What Windows version is the wireless client running?",
      "What is the exact symptom — cannot associate to the SSID, associates but authentication fails (802.1x), connects but gets no IP, assigned to wrong VLAN, or keeps disconnecting after successful auth?",
      "Is this affecting all wireless clients on the SSID, or specific client models, OS versions, or user accounts?",
      "What wireless infrastructure is in use — Cisco WLC/Catalyst Center, Meraki, Aruba Central/AOS, Ruckus SmartZone, or HPE Aruba Instant?",
      "What SSID security type is affected — WPA2-Enterprise (AES), WPA3-Enterprise (AES-256-GCM/CCMP), or WPA2-Personal?",
      "Is NPS the RADIUS backend, or is a third-party RADIUS server in use (Cisco ISE, Aruba ClearPass, FreeRADIUS)?",
      "What EAP method is configured — EAP-TLS (certificate), PEAP-MSCHAPv2 (username/password), PEAP-TLS, or TTLS?",
      "Is the Wireless AutoConfig service (WLANSVC) running on the client? (Get-Service WLANSVC | Select Status,StartType)",
      "When did this start — WAP controller firmware update, TLS certificate expiry, SSID security policy change, GPO change, or NPS server change?"
    ],
    l2: [
      "Is the wireless profile deployed via Group Policy as a Computer Configuration (Wireless Network IEEE 802.11) policy or User Configuration policy?",
      "Does the profile use machine authentication only, user authentication only, or machine-then-user (Machine or User authentication mode)?",
      "Is the WAP controller/AP configured with the correct NPS RADIUS server IPs (primary and secondary) on UDP 1812 — and the correct shared secret?",
      "What radio band and channel is the client associating on — 2.4 GHz, 5 GHz, or 6 GHz (Wi-Fi 6E)? Is band steering forcing clients to a band where authentication fails?",
      "Is PMK (Pairwise Master Key) caching or OKC (Opportunistic Key Caching) enabled on the controller — could stale PMK entries cause re-authentication failures during roaming?",
      "Is 802.11r Fast Transition (FT) or 802.11v BSS Transition Management configured — could FT-EAP be failing for clients that do not support it?",
      "What NAS-Port-Type value is the WAP controller sending in RADIUS Access-Requests — Wireless (value 19) or IEEE 802.11 (value 5)? Does the NPS Network Policy condition match?",
      "Is the RADIUS server timeout on the WAP controller sufficient for EAP-TLS multi-round-trip exchanges — minimum 10-15 seconds?",
      "Is there a RADIUS Dead Server Detection or failover mechanism on the WAP — is the secondary NPS server reachable and configured correctly?"
    ]
  },
  probing: {
    l1: [
      "Run 'Get-Service WLANSVC | Select Name,Status,StartType' — is Wireless AutoConfig service running?",
      "Run 'netsh wlan show profiles' — is the correct enterprise SSID profile present on the client?",
      "Run 'netsh wlan show profile name=\"<SSID>\" key=clear' — share the full profile output (sanitize any PSK if present).",
      "Run 'netsh wlan show interfaces' — share the current association SSID, BSSID, signal quality, authentication algorithm, and cipher.",
      "Check Security event log for Event ID 5632 (802.1x auth started) and 5633 (802.1x auth failed) — share the error code and reason from Event 5633.",
      "On the WAP controller: check the client authentication and association log for the failing client MAC — what stage does authentication fail at?",
      "Does the client receive an IP address after association? ('ipconfig /all') — if yes, 802.1x auth succeeded and the issue is DHCP; if no, auth itself failed."
    ],
    l2: [
      "Capture wireless 802.1x ETL trace: 'netsh trace start capture=yes provider=Microsoft-Windows-WLAN-AutoConfig level=5 tracefile=C:\\wlan_8021x.etl' — reproduce — stop.",
      "Run 'Get-WinEvent -LogName Microsoft-Windows-WLAN-AutoConfig/Operational | Sort TimeCreated -Descending | Select -First 50 | Format-List TimeCreated,Id,Message'",
      "On NPS: filter Security event log for Event ID 6273 — match the Calling-Station-Id attribute to the client's MAC address (format: XX-XX-XX-XX-XX-XX or XXXXXXXXXXXX depending on vendor).",
      "Run 'certutil -store My' (machine cert) and 'certutil -store -user My' (user cert) — verify subject, expiry, issuer, and EKU.",
      "Run 'gpresult /r | findstr -i \"wireless\\|WLAN\\|802.11\"' — confirm Wireless Network policy is in Applied GPOs for Computer or User.",
      "On the WAP controller: run 'debug client <MAC>' or equivalent vendor command — capture the full RADIUS exchange (Access-Request, Access-Challenge ×N, Access-Accept/Reject).",
      "Run 'netsh wlan show drivers' — share NIC driver version, radio type (802.11n/ac/ax), and supported authentication types.",
      "Run 'netsh wlan show networks mode=bssid' — share the security type, authentication, and cipher values visible for the target SSID.",
      "Verify NPS RADIUS client registration for the WAP controller IP: 'netsh nps show client' — confirm IP and shared secret hash.",
      "Run 'Get-NetAdapter | Where InterfaceDescription -like \"*wireless*\" | Select Name,Status,DriverVersion,DriverDate'"
    ]
  },
  troubleshooting: {
    l1: [
      "Restart Wireless AutoConfig service: 'Restart-Service WLANSVC' — wait 10 seconds — retry connection.",
      "Delete and recreate the wireless profile: 'netsh wlan delete profile name=\"<SSID>\"' — force GPO reapplication with 'gpupdate /force' or manually reconfigure.",
      "Verify machine certificate is enrolled, valid, and not expired: certlm.msc > Personal > Certificates.",
      "Check NPS Network Policy conditions — confirm the machine or user account is in the required Windows Group condition.",
      "Verify RADIUS shared secret is identical on NPS and the WAP controller — check for trailing whitespace in shared secret fields.",
      "If using PEAP-MSCHAPv2: confirm user's AD password has not expired — 'Get-ADUser <user> -Properties PasswordExpired | Select PasswordExpired'"
    ],
    l2: [
      "For EAP-TLS: push issuing CA root certificate to all clients via GPO: 'Computer Configuration > Windows Settings > Security Settings > Public Key Policies > Trusted Root Certification Authorities'.",
      "For PEAP server certificate not trusted by clients: in the wireless profile (GPO or manual), under Authentication > PEAP Properties, ensure the NPS server certificate issuer root CA is listed under 'Trusted Root Certification Authorities'.",
      "For roaming re-authentication failures: enable OKC on the WAP controller — confirm client profile has 'Single Sign On' disabled and no forced re-auth on roam.",
      "For machine-then-user auth failure: confirm machine authenticates at boot (using machine cert / machine credentials) before user logon — GPO Wireless Network profile > Security > Authentication Mode = 'User or Machine authentication'.",
      "For RADIUS timeout causing auth failure: on the WAP controller, set the RADIUS authentication timeout to 15-30 seconds — EAP-TLS with OCSP checking can take 5-10 seconds.",
      "For NAS-Port-Type mismatch in NPS policy: capture a RADIUS packet — confirm the exact NAS-Port-Type value sent by the WAP — update NPS Network Policy condition to match.",
      "For 802.11r Fast Transition (FT) causing EAP-TLS failure: disable FT on the SSID (test environment) — some Windows clients do not fully support FT-EAP mode.",
      "Analyze WLAN AutoConfig ETL trace: use Event Viewer or tracerpt — look for EAP method negotiation (WLAN-AutoConfig event 8001/8002), TLS Alert Codes (40=handshake_failure, 42=bad_certificate, 44=certificate_revoked, 46=certificate_unknown, 48=unknown_ca)."
    ]
  },
  datacollection: {
    l1: [
      "Run 'netsh wlan show profiles > C:\\wlan_profiles.txt'",
      "Run 'netsh wlan show interfaces > C:\\wlan_interfaces.txt'",
      "Export Security event log: 'wevtutil epl Security C:\\Security_Events_Client.evtx'",
      "Run 'netsh wlan show drivers > C:\\wlan_drivers.txt'"
    ],
    l2: [
      "Capture WLAN 802.1x trace: 'netsh trace start capture=yes provider=Microsoft-Windows-WLAN-AutoConfig level=5 keywords=0xFFFFFFFF tracefile=C:\\wlan_8021x_trace.etl' — reproduce — stop.",
      "Export WLAN-AutoConfig Operational log: 'wevtutil epl Microsoft-Windows-WLAN-AutoConfig/Operational C:\\WLAN_AutoConfig_Operational.evtx'",
      "Run 'certutil -store My > C:\\machine_cert_store.txt' and 'certutil -store -user My > C:\\user_cert_store.txt'",
      "Collect WAP controller logs: client association log, RADIUS proxy log, and 802.11 state machine log for the failing client MAC.",
      "Run 'gpresult /h C:\\gpo_wireless_report.html'",
      "Run 'Get-NetAdapter | Select Name,Status,DriverVersion,DriverDate,InterfaceDescription | Out-File C:\\nic_info.txt'",
      "Collect NPS IAS logs and Security event log from the NPS server."
    ]
  }
},

// ─────────────────────────────────────────────────────────────────────────────
//  VPN
// ─────────────────────────────────────────────────────────────────────────────
vpn: {
  label: "VPN", icon: "🔒", category: "Remote Access",
  scoping: {
    l1: [
      "What VPN tunnel type is in use — SSTP (TCP 443), IKEv2 (UDP 500/4500), L2TP/IPsec (UDP 1701/500/4500), PPTP (TCP 1723, GRE), or Always On VPN (AOVPN) Device/User Tunnel?",
      "What Windows version is the VPN client, and what OS is the VPN server (Windows Server RRAS, Azure VPN Gateway, or third-party appliance)?",
      "Is this a Remote Access VPN (per-user dial-in) or a Site-to-Site (gateway-to-gateway) IPsec tunnel?",
      "What is the exact error code displayed at connection time? (Error 691, 812, 809, 789, 13801, 868, 800, 619, 721)",
      "Is the failure at authentication (credentials/certificate rejected), tunnel establishment (IKE/IPsec phase failure), or post-connect (tunnel up but no access to resources)?",
      "Is this affecting all VPN users or specific users, devices, or locations (e.g., only from behind certain NATs)?",
      "Is the VPN server Windows RRAS, Azure VPN Gateway (Route-Based or Policy-Based), DirectAccess, or a third-party device?",
      "What authentication method is configured — NPS/RADIUS with PEAP or EAP-TLS, certificate-only (IKEv2), PAP, MS-CHAPv2, or EAP-MS-CHAPv2?",
      "When did the issue start — server certificate expiry, NPS configuration change, firewall rule change, Windows Update, or new client device/OS?",
      "Can the VPN client reach the VPN server public IP or FQDN from the internet before attempting to connect? (Test-NetConnection <VPN IP or FQDN> -Port 443 / 500)"
    ],
    l2: [
      "For IKEv2: what machine certificate and user certificate are in use — are they valid, not expired, issued by the correct CA, and contain the required EKUs (Server Authentication for server cert, Client Authentication for user cert, IP Security IKE Intermediate for IKEv2)?",
      "For SSTP: is the VPN server SSL certificate trusted by the client — is the full certificate chain present, the root CA trusted, and the certificate CN/SAN matching the server FQDN/IP?",
      "For Always On VPN: is this the Device Tunnel (machine cert, connects before logon) or User Tunnel (user cert or MSCHAPv2, connects at user logon)? What is the AOVPN profile source (Intune, SCCM, manual)?",
      "Is split tunneling configured — what specific routes are pushed to the VPN client via RRAS static routes or AOVPN VPNv2 profile RouteList? Is the failing resource reachable via a pushed route?",
      "What NPS Connection Request Policy and Network Policy are matching VPN authentication — what conditions, constraints, and RADIUS attributes are configured?",
      "Are all required firewall rules and NAT translations in place — IKEv2 (UDP 500, UDP 4500), SSTP (TCP 443), L2TP (UDP 1701, UDP 500, UDP 4500, ESP protocol 50)?",
      "Is NAT Traversal (NAT-T) enabled on the RRAS server for IKEv2 and L2TP clients connecting from behind NAT? (HKLM:\\SYSTEM\\CurrentControlSet\\Services\\RemoteAccess\\Parameters\\Ikev2\\NatTraversalMode)",
      "What DNS servers and DNS suffixes are pushed to VPN clients post-connection — are they reachable through the VPN tunnel? Are NRPT rules configured for the VPN domain suffix?",
      "For AOVPN: is the XML VPN profile correctly structured per Microsoft's AOVPN CSP (VPNv2 Profile) specification — are there syntax errors in the profile XML?"
    ]
  },
  probing: {
    l1: [
      "What is the exact 4-digit or 5-digit Windows VPN error code? (visible in the VPN connection UI or Event Viewer > System — Source: RasClient, Event ID 20227 or 20228)",
      "Run 'Test-NetConnection -ComputerName <VPN server FQDN> -Port 443' (SSTP) or '-Port 500' (IKEv2) — is the server reachable from the client network?",
      "On the VPN server: review System event log — filter on source 'RemoteAccess' or 'RasServer' — note Event IDs 20063 (auth failure), 20249 (IPsec negotiation failure).",
      "Run 'Get-Service RemoteAccess | Select Name,Status,StartType' on the RRAS server.",
      "On NPS: filter Security event log for Event ID 6273 — note Reason Code and username/device.",
      "Run 'ipconfig /all' on the client before and after VPN connection — compare DNS servers, default gateway, and new VPN adapter routes.",
      "Can the same user connect from a different client machine — isolates machine-specific (cert, profile) vs. user-specific (credentials, account) issues?"
    ],
    l2: [
      "On the RRAS server: enable PPP tracing — 'netsh ras set tracing * enabled' — reproduce — collect C:\\Windows\\tracing\\ppp*.log — disable: 'netsh ras set tracing * disabled'",
      "Run 'Get-VpnConnection | Select Name,ServerAddress,TunnelType,AuthenticationMethod,EncryptionLevel,SplitTunneling,DnsSuffix' — share all VPN connection profiles.",
      "For IKEv2: 'netsh ike show certmap' — confirm the machine certificate is mapped to the IKEv2 interface for authentication.",
      "Run 'Get-VpnServerConfiguration' on the RRAS server — share TunnelType, IPv4AddressRange, IPv4DnsServer, and EncryptionType.",
      "For AOVPN: export Device Tunnel profile — 'Get-VpnConnection -AllUserConnection | ConvertTo-Json | Out-File C:\\aovpn_device_tunnel.json' — and User Tunnel: 'Get-VpnConnection | ConvertTo-Json'",
      "Run 'netsh ras show authtype > C:\\ras_authtype.txt' and 'netsh ras show protocol > C:\\ras_protocols.txt' on RRAS server.",
      "Capture IKE trace: 'netsh trace start capture=yes provider=Microsoft-Windows-IKEEXT level=5 tracefile=C:\\ike_trace.etl' — reproduce — stop.",
      "For SSTP: run 'netsh http show sslcert ipport=0.0.0.0:443' — confirm certhash matches the expected VPN server certificate thumbprint.",
      "Run 'Get-RemoteAccessConnectionStatistics | Format-List' — check ActiveConnections, TotalConnectionsToDate, and failed connection count.",
      "Run 'netsh ipsec dynamic show all > C:\\ipsec_dynamic_state.txt' on both client and server for IPsec/L2TP phase analysis.",
      "For AOVPN: check Intune/SCCM deployment status — confirm profile is deployed and applied — 'Get-WmiObject -Namespace root\\cimv2\\mdm\\dmmap -Class MDM_VPNv2_01' on the client."
    ]
  },
  troubleshooting: {
    l1: [
      "Error 691 (auth failed / access denied): verify username/password, check AD account not locked, and confirm NPS Network Policy matches VPN connection request.",
      "Error 812 (connection prevented by policy in RAS/NPS server): NPS is rejecting — check Event 6273 Reason Code — verify NPS policy conditions, constraints, and that the user account has Allow Access.",
      "Error 809 (network connection could not be established — IKEv2): firewall is blocking UDP 500 or 4500 — verify all NATs and firewalls permit these ports bidirectionally.",
      "Error 789 (L2TP connection attempt failed — security negotiation failed): machine certificate missing or wrong for L2TP/IPsec, or IPsec policy mismatch — switch to pre-shared key for testing, then resolve cert issue.",
      "Error 13801 (IKEv2 authentication credentials unacceptable): machine cert missing, expired, wrong CA, or missing IKE EKU — re-enroll from the correct certificate template.",
      "Error 868 (remote access connection failed — name could not be resolved): DNS cannot resolve the VPN server FQDN — test with IP address directly; if that works, DNS is the issue.",
      "Restart RRAS: 'Restart-Service RemoteAccess' — wait 60-90 seconds for all interfaces to initialize — retest."
    ],
    l2: [
      "For SSTP certificate binding: rebind the correct cert — 'netsh http add sslcert ipport=0.0.0.0:443 certhash=<thumbprint> appid={ba195980-cd49-458b-9e23-c84ee0adcd75}' — verify with 'netsh http show sslcert'",
      "For IKEv2 machine cert not being offered: verify cert is in LocalMachine\\My store, contains IP Security IKE Intermediate EKU (OID 1.3.6.1.5.5.8.2.2) or Server Authentication EKU, and the CN/SAN matches the RRAS server FQDN.",
      "For AOVPN Device Tunnel not connecting: confirm client machine is domain-joined, Device Tunnel profile deployed as AllUserConnection, machine cert valid, and the profile NativeProtocol = IKEv2 only.",
      "For split tunnel route issues: 'Get-VpnConnectionRoute -ConnectionName <name>' — confirm all corporate subnets are in IncludeRoutes list; remove conflicting ExcludeRoutes.",
      "For DNS not resolving over VPN: confirm correct DNS servers are pushed — 'Get-VpnConnection | Select DnsSuffix,SplitTunneling' — and NRPT rules include the VPN domain suffix: 'Get-DnsClientNrptRule'",
      "For IKEv2 NAT-T failure (client behind NAT): enable NAT-T on RRAS — 'Set-ItemProperty -Path \"HKLM:\\SYSTEM\\CurrentControlSet\\Services\\RemoteAccess\\Parameters\\Ikev2\" -Name NatTraversalMode -Value 2' (0=off, 1=on, 2=force) — reboot RRAS.",
      "Analyze IKE ETL trace: use 'tracerpt C:\\ike_trace.etl' — look for IKE_AUTH failure notifications: NO_PROPOSAL_CHOSEN (cipher suite mismatch), TS_UNACCEPTABLE (traffic selector mismatch), AUTHENTICATION_FAILED (cert or PSK failure).",
      "For RRAS running out of VPN ports: 'Get-RemoteAccessConnectionStatistics | Select ActiveConnections' — increase port count in RRAS MMC: Ports > Properties > SSTP/IKEv2 — increase maximum ports.",
      "For Always On VPN with Intune: run 'MDMDiagnosticsTool.exe -out C:\\MDMLogs\\' — review MDMDiagReport.xml for VPN profile deployment errors.",
      "For IPsec SA failures with mismatched proposals: run 'Get-NetIPsecRule | Select DisplayName,Mode,InboundSecurity,OutboundSecurity' and compare IKE Phase 1/Phase 2 proposals between client and server."
    ]
  },
  datacollection: {
    l1: [
      "Export System event log: 'wevtutil epl System C:\\System_Events_VPN.evtx'",
      "Run 'Get-VpnConnection | Out-File C:\\vpn_client_connections.txt'",
      "Run 'ipconfig /all > C:\\ipconfig_before_vpn.txt' (before attempt); 'ipconfig /all > C:\\ipconfig_after_vpn.txt' (after attempt)",
      "On NPS: export Security event log: 'wevtutil epl Security C:\\NPS_Security_Events.evtx'"
    ],
    l2: [
      "Enable RRAS PPP tracing: 'netsh ras set tracing * enabled' — reproduce — collect C:\\Windows\\tracing\\ppp*.log — disable: 'netsh ras set tracing * disabled'",
      "Capture IKE trace: 'netsh trace start capture=yes provider=Microsoft-Windows-IKEEXT level=5 tracefile=C:\\ike_ikeext.etl' — reproduce — stop.",
      "Run 'Get-VpnServerConfiguration | Out-File C:\\rras_vpn_server_config.txt' on the RRAS server.",
      "Run 'netsh ras show authtype > C:\\ras_authtype.txt' and 'netsh ras show protocol > C:\\ras_protocol.txt'",
      "Run 'netsh ipsec dynamic show all > C:\\ipsec_dynamic.txt' on both client and RRAS server.",
      "Export AOVPN profiles: 'Get-VpnConnection -AllUserConnection | ConvertTo-Json | Out-File C:\\aovpn_device.json'; 'Get-VpnConnection | ConvertTo-Json | Out-File C:\\aovpn_user.json'",
      "Run 'certutil -store My > C:\\rras_server_certs.txt' on the RRAS server.",
      "Collect NPS verbose trace: 'netsh nps set tracing mode=all' — reproduce — disable — collect C:\\Windows\\tracing\\nps.log",
      "Run 'MDMDiagnosticsTool.exe -out C:\\MDMLogs\\' on the client if AOVPN is deployed via Intune."
    ]
  }
}

}; // end QUESTION_BANK

// ─── Technology category groupings for UI ────────────────────────────────────
const TECH_CATEGORIES = {
  "Core Networking":  ["dns_server","dns_client","dhcp_server","dhcp_client","tcpip","smb","dfs"],
  "Authentication":   ["nps","dot1x_wired","dot1x_wireless"],
  "Remote Access":    ["vpn"]
};

if (typeof module !== 'undefined') module.exports = { QUESTION_BANK, TECH_CATEGORIES };