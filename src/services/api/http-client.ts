import { publicEnv } from "@/lib/env/public";
import type { ApiError, ApiResult } from "@/types/api";

type HttpClientOptions = {
  baseUrl?: string;
  headers?: HeadersInit;
  fetcher?: typeof fetch;
};

type RequestOptions = RequestInit & {
  query?: Record<string, string | number | boolean | null | undefined>;
};

export function createHttpClient(options: HttpClientOptions = {}) {
  const baseUrl = options.baseUrl ?? "";
  const fetcher = options.fetcher ?? fetch;

  async function request<TData>(
    path: string,
    requestOptions: RequestOptions = {},
  ): Promise<ApiResult<TData>> {
    const { query, headers, ...init } = requestOptions;
    const url = buildUrl(baseUrl, path, query);

    try {
      const response = await fetcher(url, {
        ...init,
        headers: {
          "content-type": "application/json",
          ...options.headers,
          ...headers,
        },
      });

      const payload = await readJson(response);

      if (!response.ok) {
        return {
          ok: false,
          error: normalizeApiError(payload, response.status),
        };
      }

      return {
        ok: true,
        data: payload as TData,
      };
    } catch (error) {
      return {
        ok: false,
        error: {
          code: "NETWORK_ERROR",
          message:
            error instanceof Error ? error.message : "Network request failed.",
        },
      };
    }
  }

  return {
    get: <TData>(path: string, init?: RequestOptions) =>
      request<TData>(path, { ...init, method: "GET" }),
    post: <TData, TBody = unknown>(
      path: string,
      body?: TBody,
      init?: RequestOptions,
    ) =>
      request<TData>(path, {
        ...init,
        method: "POST",
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
    request,
  };
}

function buildUrl(
  baseUrl: string,
  path: string,
  query?: RequestOptions["query"],
) {
  const isAbsolute = /^https?:\/\//.test(path);
  const normalizedBase = baseUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(
    isAbsolute ? path : `${normalizedBase}${normalizedPath}`,
    isAbsolute ? undefined : publicEnv.appUrl,
  );

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
}

async function readJson(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function normalizeApiError(payload: unknown, status: number): ApiError {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof payload.error === "object"
  ) {
    const error = payload.error as Partial<ApiError>;

    return {
      code: error.code ?? `HTTP_${status}`,
      message: error.message ?? "Request failed.",
      details: error.details,
    };
  }

  return {
    code: `HTTP_${status}`,
    message: typeof payload === "string" ? payload : "Request failed.",
  };
}

export const apiClient = createHttpClient({
  baseUrl: publicEnv.apiBaseUrl,
});
