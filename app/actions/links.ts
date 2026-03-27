"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  createLinkInputSchema,
  updateLinkStatusSchema,
} from "@/lib/validation/url";
import { env } from "@/lib/env";
import { logger } from "@/lib/observability/logger";
import type {
  ActionResult,
  CreateLinkResult,
  UpdateStatusResult,
} from "@/lib/links/types";
import { nanoid } from "nanoid";

export async function createShortLinkAction(
  input: unknown,
): Promise<ActionResult<CreateLinkResult>> {
  const parsed = createLinkInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: "VALIDATION",
        message: parsed.error.issues.map((i) => i.message).join("; "),
      },
    };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error: {
        code: "UNAUTHORIZED",
        message: "You must be signed in to create a link",
      },
    };
  }

  const slug = parsed.data.customSlug ?? nanoid(8);

  const { data, error } = await supabase
    .from("short_links")
    .insert({
      owner_id: user.id,
      slug,
      destination_url: parsed.data.destinationUrl,
      title: parsed.data.title ?? null,
    })
    .select("id, slug")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: { code: "CONFLICT", message: "This slug is already taken" },
      };
    }
    logger.error("Failed to create short link", {
      error: error.message,
      userId: user.id,
    });
    return {
      ok: false,
      error: {
        code: "UNKNOWN",
        message: "Failed to create link. Please try again.",
      },
    };
  }

  return {
    ok: true,
    data: {
      linkId: data.id as string,
      slug: data.slug as string,
      shortUrl: `${env.APP_BASE_URL}/s/${data.slug}`,
    },
  };
}

export async function updateShortLinkStatusAction(
  input: unknown,
): Promise<ActionResult<UpdateStatusResult>> {
  const parsed = updateLinkStatusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: "VALIDATION",
        message: parsed.error.issues.map((i) => i.message).join("; "),
      },
    };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error: { code: "UNAUTHORIZED", message: "You must be signed in" },
    };
  }

  const { data, error } = await supabase
    .from("short_links")
    .update({ is_active: parsed.data.isActive })
    .eq("id", parsed.data.linkId)
    .eq("owner_id", user.id)
    .select("id, is_active")
    .single();

  if (error || !data) {
    logger.error("Failed to update link status", {
      error: error?.message,
      linkId: parsed.data.linkId,
    });
    return {
      ok: false,
      error: { code: "UNKNOWN", message: "Failed to update link status" },
    };
  }

  return {
    ok: true,
    data: {
      linkId: data.id as string,
      isActive: data.is_active as boolean,
    },
  };
}
