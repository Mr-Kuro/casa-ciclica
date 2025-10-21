/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { loadSortPrefs, saveSortPrefs } from "../utils/sortStorage";

// Simple test to ensure persistence helpers interact with localStorage correctly

describe("Sort preferences persistence", () => {
  const RAW_KEY = "taskSortPrefs"; // mirror internal STORAGE_KEY
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns undefined when nothing stored", () => {
    const prefs = loadSortPrefs();
    expect(prefs).toBeUndefined();
  });

  it("persists and loads a valid preference", () => {
    saveSortPrefs({ key: "proxima", dir: "desc" });
    const prefs = loadSortPrefs();
    expect(prefs).toEqual({ key: "proxima", dir: "desc" });
  });

  it("returns undefined on malformed JSON", () => {
    localStorage.setItem(RAW_KEY, "{ invalid json");
    const prefs = loadSortPrefs();
    expect(prefs).toBeUndefined();
  });

  it("returns undefined on invalid structure", () => {
    localStorage.setItem(RAW_KEY, JSON.stringify({ foo: "bar" }));
    const prefs = loadSortPrefs();
    expect(prefs).toBeUndefined();
  });

  it("accepts any string key (no whitelist)", () => {
    localStorage.setItem(RAW_KEY, JSON.stringify({ key: "xxx", dir: "asc" }));
    const prefs = loadSortPrefs();
    expect(prefs).toEqual({ key: "xxx", dir: "asc" });
  });

  it("returns undefined on invalid dir", () => {
    localStorage.setItem(RAW_KEY, JSON.stringify({ key: "titulo", dir: "up" }));
    const prefs = loadSortPrefs();
    expect(prefs).toBeUndefined();
  });
});
