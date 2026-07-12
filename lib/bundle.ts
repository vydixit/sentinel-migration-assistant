"use client";

import JSZip from "jszip";
import { SCRIPT_FILES } from "./data/scripts";

export async function downloadScriptBundle() {
  const zip = new JSZip();
  Object.entries(SCRIPT_FILES).forEach(([path, content]) => {
    zip.file(path, content);
  });
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sentinel-migration-scripts.zip";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
