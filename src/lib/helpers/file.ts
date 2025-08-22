import { open } from "@tauri-apps/plugin-dialog";

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
