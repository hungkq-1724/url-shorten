export interface ShortLink {
  id: string;
  owner_id: string;
  slug: string;
  destination_url: string;
  title: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateLinkInput {
  destinationUrl: string;
  customSlug?: string;
  title?: string;
}

export interface UpdateLinkStatusInput {
  linkId: string;
  isActive: boolean;
}

export type ActionSuccess<T> = { ok: true; data: T };
export type ActionError = {
  ok: false;
  error: {
    code: "VALIDATION" | "CONFLICT" | "UNAUTHORIZED" | "UNKNOWN";
    message: string;
  };
};
export type ActionResult<T> = ActionSuccess<T> | ActionError;

export interface CreateLinkResult {
  linkId: string;
  slug: string;
  shortUrl: string;
}

export interface UpdateStatusResult {
  linkId: string;
  isActive: boolean;
}
