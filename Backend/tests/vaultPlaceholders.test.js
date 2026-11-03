import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Guards against sample data creeping back into the Health Vault pages.
const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../Frontend");
const read = (file) => readFileSync(path.join(frontend, file), "utf8");

describe("Health Vault pages ship no sample data", () => {
  const vaultHtml = read("HTML/health-vault.html");
  const recordsHtml = read("HTML/medical-records.html");
  const appJs = read("JS/app.js");

  test("health-vault.html has no made-up names, counts or dates", () => {
    for (const fake of ["Zainab", "Sarah Mitchell", "Robert Chen", "O-Positive", "Fully synchronized"]) {
      assert.ok(!vaultHtml.includes(fake), `found sample text: ${fake}`);
    }
    assert.ok(!/\d+ Files/.test(vaultHtml), "found a hardcoded file count");
    assert.ok(!/Last updated \d/.test(vaultHtml), "found a hardcoded 'Last updated' date");
  });

  test("every Health Vault element is filled by real data (backend routes exist in app.js)", () => {
    for (const id of ["trustedAccessList", "vaultActivityBody", "vitalBloodType", "vaultDocsList"]) {
      assert.ok(vaultHtml.includes(`id="${id}"`), `missing #${id}`);
      assert.ok(appJs.includes(id), `#${id} is never filled by app.js`);
    }
    assert.ok(appJs.includes("/health-documents"), "health-vault page does not call the documents API");
  });

  test("medical-records vault card has no empty or data-less placeholders", () => {
    assert.ok(!recordsHtml.includes("vaultBloodPressure"), "'Last BP' has no data source and must stay removed");
    for (const id of ["vaultBloodType", "vaultAllergies"]) {
      assert.ok(recordsHtml.includes(`id="${id}"`), `missing #${id}`);
      assert.ok(appJs.includes(`#${id}`), `#${id} is never filled by app.js`);
    }
    assert.ok(appJs.includes("/users/me/health-profile"), "vault card does not read the saved health profile");
  });
});
