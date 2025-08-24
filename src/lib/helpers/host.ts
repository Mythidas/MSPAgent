import { invoke } from "@tauri-apps/api/core";

export async function getDeviceName() {
  try {
    return await invoke<string>("get_device_name");
  } catch {
    return null;
  }
}
