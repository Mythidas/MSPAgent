import { getRegistryKey } from "@/lib/helpers/registry";

export async function getAPIEndpoint() {
  try {
    const currentKey = await getRegistryKey(
      "SOFTWARE\\MSPByte\\MSPAgent",
      "APIEndpoint"
    );

    return currentKey;
  } catch {
    console.error("Failed to access registry");
    return null;
  }
}

export async function getAPIKey() {
  try {
    const currentKey = await getRegistryKey(
      "SOFTWARE\\MSPByte\\MSPAgent",
      "APIKey"
    );

    if (!currentKey) {
      console.error("Failed to find APIKey");
      return null;
    }

    return currentKey;
  } catch (e) {
    console.error("Failed to access registry");
    return null;
  }
}
