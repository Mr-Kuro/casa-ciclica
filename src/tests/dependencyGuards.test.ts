import { describe, expect, test } from "vitest";
import { readdirSync, statSync, readFileSync } from "fs";
import { join } from "path";

const SRC = join(process.cwd(), "src");

function collect(pattern: RegExp, root: string): Record<string, string> {
  const out: Record<string, string> = {};
  function walk(dir: string) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) walk(full);
      else if (pattern.test(full)) out[full] = readFileSync(full, "utf8");
    }
  }
  walk(root);
  return out;
}

function findImportOffenders(
  files: Record<string, string>,
  forbidden: string[]
) {
  const offenders: string[] = [];
  Object.entries(files).forEach(([file, content]) => {
    content.split(/\r?\n/).forEach((line) => {
      if (!line.startsWith("import")) return;
      if (forbidden.some((token) => line.includes(token))) {
        offenders.push(`${file}: ${line}`);
      }
    });
  });
  return offenders;
}

describe("Atomic architecture dependency guards", () => {
  test("atoms must not import molecules/organisms/templates (paths & aliases)", () => {
    const files = collect(
      /components\/atoms\/.*\.(ts|tsx)$/i,
      join(SRC, "components", "atoms")
    );
    const forbidden = [
      "components/molecules",
      "components/organisms",
      "components/templates",
      "@molecules/",
      "@organisms/",
      "@templates/",
    ];
    expect(findImportOffenders(files, forbidden)).toEqual([]);
  });

  test("molecules must not import organisms/templates (paths & aliases)", () => {
    const files = collect(
      /components\/molecules\/.*\.(ts|tsx)$/i,
      join(SRC, "components", "molecules")
    );
    const forbidden = [
      "components/organisms",
      "components/templates",
      "@organisms/",
      "@templates/",
    ];
    expect(findImportOffenders(files, forbidden)).toEqual([]);
  });

  test("organisms must not import templates (paths & aliases)", () => {
    const files = collect(
      /components\/organisms\/.*\.(ts|tsx)$/i,
      join(SRC, "components", "organisms")
    );
    const forbidden = ["components/templates", "@templates/"];
    expect(findImportOffenders(files, forbidden)).toEqual([]);
  });

  test("templates must not import legacy views/pages", () => {
    const templatesDir = join(SRC, "components", "templates");
    const files = collect(
      /components\/templates\/.*\.(ts|tsx)$/i,
      templatesDir
    );
    const forbidden = ["views/pages", "views/components"];
    expect(findImportOffenders(files, forbidden)).toEqual([]);
  });
});
