import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const outputDirectory = fileURLToPath(new URL("./csv/", import.meta.url));
const anonymizedRows = [
  ["district_zone", "pregnancy_stage", "severity", "screening_count", "referral_count"],
  ["Zone-A", "third_trimester", "Red", "2", "2"],
  ["Zone-B", "second_trimester", "Yellow", "3", "0"],
  ["Zone-A", "third_trimester", "Orange", "1", "1"]
];

await mkdir(outputDirectory, { recursive: true });
const csv = anonymizedRows.map((row) => row.join(",")).join("\n") + "\n";
await writeFile(join(outputDirectory, "maternal_analytics_anonymized.csv"), csv, "utf8");
console.log("Anonymized analytics export created in lakehouse/export/csv.");
