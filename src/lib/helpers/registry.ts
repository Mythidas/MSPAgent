import { invoke } from "@tauri-apps/api/core";

export async function getRegistryKey(path: string, value: string) {
  try {
    return await invoke<string>("read_registry_value", {
      path,
      value,
    });
  } catch {
    return null;
  }
}

export async function setRegistryKey(
  path: string,
  value: string,
  data: string
) {
  try {
    await invoke("write_registry_value", {
      path,
      value,
      data,
    });

    return true;
  } catch (e: any) {
    console.log(e);
    return false;
  }
}
