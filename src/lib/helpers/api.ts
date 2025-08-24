import { getRegistryKey } from "@/lib/helpers/registry";

export async function getAPIKey() {
  const currentKey = await getRegistryKey(
    "SOFTWARE\\MSPByte\\MSPAgent",
    "APIKey"
  );
  console.log(currentKey);
}
