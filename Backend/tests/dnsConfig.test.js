import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import dns from "node:dns";
import { applyDnsServersFromEnv } from "../src/utils/dnsConfig.js";

describe("DNS override is opt-in", () => {
  let originalServers;
  let originalWarn;

  beforeEach(() => {
    originalServers = dns.getServers();
    originalWarn = console.warn;
    delete process.env.DNS_SERVERS;
  });

  afterEach(() => {
    dns.setServers(originalServers);
    console.warn = originalWarn;
    delete process.env.DNS_SERVERS;
  });

  test("does nothing when DNS_SERVERS is not set (production default)", () => {
    assert.equal(applyDnsServersFromEnv(), false);
    assert.deepEqual(dns.getServers(), originalServers);
  });

  test("does nothing when DNS_SERVERS is blank", () => {
    process.env.DNS_SERVERS = "   ";
    assert.equal(applyDnsServersFromEnv(), false);
    assert.deepEqual(dns.getServers(), originalServers);
  });

  test("uses the servers from DNS_SERVERS when set", () => {
    process.env.DNS_SERVERS = "8.8.8.8, 8.8.4.4";
    assert.equal(applyDnsServersFromEnv(), true);
    assert.deepEqual(dns.getServers(), ["8.8.8.8", "8.8.4.4"]);
  });

  test("an invalid value is ignored with a warning instead of crashing the server", () => {
    const warnings = [];
    console.warn = (message) => warnings.push(message);
    process.env.DNS_SERVERS = "not-an-ip";
    assert.equal(applyDnsServersFromEnv(), false);
    assert.deepEqual(dns.getServers(), originalServers);
    assert.match(warnings[0], /Ignoring invalid DNS_SERVERS/);
  });
});
