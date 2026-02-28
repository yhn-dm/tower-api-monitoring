/**
 * One HTTP request; returns status, latency, and size (7s timeout).
 */
import axios, { AxiosError } from "axios";

export async function performHttpCheck(url: string, method: string) {
  const start = Date.now();

  try {
    const res = await axios({
      url,
      method,
      timeout: 7000,
      validateStatus: () => true
    });

    const latency = Date.now() - start;

    const responseBody = res.data ?? "";
    const responseSize = Buffer.byteLength(
      typeof responseBody === "string" ? responseBody : JSON.stringify(responseBody)
    );

    return {
      status: "UP" as const,
      httpStatus: res.status,
      latencyMs: latency,
      responseSizeBytes: responseSize,
      error: null
    };
  }

  catch (err: any) {
    const latency = Date.now() - start;

    // handle Axios errors (timeout, network, etc.)
    if (err instanceof AxiosError) {
      if (err.code === "ECONNABORTED") {
        return {
          status: "TIMEOUT" as const,
          httpStatus: null,
          latencyMs: null,
          responseSizeBytes: 0,
          error: "Timeout"
        };
      }

      return {
        status: "ERROR" as const,
        httpStatus: err.response?.status ?? null,
        latencyMs: null,
        responseSizeBytes: 0,
        error: err.message
      };
    }

    return {
      status: "ERROR" as const,
      httpStatus: null,
      latencyMs: null,
      responseSizeBytes: 0,
      error: String(err)
    };
  }
}
