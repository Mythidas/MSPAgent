import { getDeviceName } from "@/lib/helpers/host";
import { getRegistryKey, setRegistryKey } from "@/lib/helpers/registry";
import { fetch } from "@tauri-apps/plugin-http";

export async function getAPIKey() {
  try {
    const currentKey = await getRegistryKey(
      "SOFTWARE\\MSPByte\\MSPAgent",
      "APIKey"
    );

    if (!currentKey) {
      const enrollmentSecret = await getRegistryKey(
        "SOFTWARE\\MSPByte\\MSPAgent",
        "EnrollmentSecret"
      );
      const deviceName = await getDeviceName();
      if (!enrollmentSecret || !deviceName) {
        console.error("Failed to get registration info");
        return null;
      }

      try {
        const response = await fetch(
          `http://192.168.1.112:3000/api/agent/bootstrap`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              enrollmentSecret,
              deviceName,
            }),
          }
        );
        if (!response.ok) {
          console.error("Failed to register device");
          return null;
        }

        const data = await response.json();
        const { apiKey, deviceId } = data;

        await setRegistryKey("SOFTWARE\\MSPByte\\MSPAgent", "APIKey", apiKey);
        await setRegistryKey(
          "SOFTWARE\\MSPByte\\MSPAgent",
          "DeviceID",
          deviceId
        );
        await setRegistryKey(
          "SOFTWARE\\MSPByte\\MSPAgent",
          "EnrollmentSecret",
          ""
        );

        return apiKey;
      } catch (e: any) {
        console.log("Failed to fetch API Key");
        return null;
      }
    }

    return currentKey;
  } catch (e) {
    console.error("Failed to access registry");
    return null;
  }
}
