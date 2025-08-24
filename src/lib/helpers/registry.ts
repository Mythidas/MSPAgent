import { invoke } from "@tauri-apps/api/core";

export async function getRegistryKey(path: string, value: string) {
  return await invoke<string>("read_registry_value", {
    path,
    value,
  });
}

export async function setRegistryKey(
  path: string,
  value: string,
  data: string
) {
  await invoke("write_registry_value", {
    path,
    value,
    data,
  });
}
