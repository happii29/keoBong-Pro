export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiResult<TData> =
  | {
      ok: true;
      data: TData;
      meta?: ApiMeta;
    }
  | {
      ok: false;
      error: ApiError;
    };

export type ApiMeta = {
  requestId?: string;
  cursor?: string;
};

export type Paginated<TItem> = {
  items: TItem[];
  nextCursor?: string;
};
