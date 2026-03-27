import { z } from "zod";

const PRIVATE_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "10.",
  "172.16.",
  "192.168.",
]);

function isPrivateHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (PRIVATE_HOSTS.has(lower)) return true;
  for (const prefix of PRIVATE_HOSTS) {
    if (lower.startsWith(prefix)) return true;
  }
  return false;
}

export const destinationUrlSchema = z
  .string()
  .url("Must be a valid URL")
  .refine((url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
      return false;
    }
  }, "Only http and https URLs are allowed")
  .refine((url) => {
    try {
      const parsed = new URL(url);
      return !isPrivateHost(parsed.hostname);
    } catch {
      return false;
    }
  }, "Private or internal URLs are not allowed");

const SLUG_PATTERN = /^[a-zA-Z0-9_-]+$/;

export const slugSchema = z
  .string()
  .min(5, "Slug must be at least 5 characters")
  .max(32, "Slug must be at most 32 characters")
  .regex(
    SLUG_PATTERN,
    "Slug may only contain letters, numbers, hyphens, and underscores",
  );

export const createLinkInputSchema = z.object({
  destinationUrl: destinationUrlSchema,
  customSlug: slugSchema.optional(),
  title: z.string().max(200).optional(),
});

export const updateLinkStatusSchema = z.object({
  linkId: z.string().uuid(),
  isActive: z.boolean(),
});

export type CreateLinkInput = z.infer<typeof createLinkInputSchema>;
export type UpdateLinkStatusInput = z.infer<typeof updateLinkStatusSchema>;
