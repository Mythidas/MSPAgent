import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { exists, readFile } from "@tauri-apps/plugin-fs";

export async function chooseFileDialog() {
  const file = await open({
    multiple: false,
    directory: false,
    filters: [
      {
        name: "Image",
        extensions: ["png", "jpeg", "jpg"],
      },
    ],
  });

  return file;
}

export async function readFileText(path: string) {
  const content = await invoke<string>("read_file_text", {
    path: path,
  });

  return content;
}

export async function readFileBinary(path: string) {
  if (await exists(path)) {
    const file = await readFile(path);
    return file;
  }

  return null;
}
