import dns from "dns";

// Optional DNS override, OFF unless DNS_SERVERS is set.
//
// Some home/office networks cannot resolve the SRV record behind a mongodb+srv:// URL
// (error: "querySrv ECONNREFUSED"). If that happens on YOUR computer, add this line to your
// local Backend/.env:
//     DNS_SERVERS=8.8.8.8,8.8.4.4
// Do NOT set it on the server (Vercel etc.): production should use the platform's own DNS.
//
// Call it right after dotenv.config() and before connecting to the database.
export const applyDnsServersFromEnv = () => {
  const raw = process.env.DNS_SERVERS;
  if (!raw || !raw.trim()) return false;

  const servers = raw.split(",").map((server) => server.trim()).filter(Boolean);
  try {
    dns.setServers(servers);
    return true;
  } catch (error) {
    console.warn(`Ignoring invalid DNS_SERVERS value: ${error.message}`);
    return false;
  }
};
