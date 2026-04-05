export interface ShortenResponse {
  short_url: string;
  code: string;
}

export interface HistoryEntry {
  originalUrl: string;
  shortUrl: string;
  code: string;
  createdAt: string;
}
