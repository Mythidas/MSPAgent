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

export async function readFileBinary(path: string) {
  if (await exists(path)) {
    const file = await readFile(path);
    return file;
  }

  return null;
}
