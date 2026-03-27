"use client";

import { useActionState } from "react";
import { createShortLinkAction } from "@/app/actions/links";
import type { ActionResult, CreateLinkResult } from "@/lib/links/types";

const initialState: ActionResult<CreateLinkResult> | null = null;

async function formAction(
  _prev: ActionResult<CreateLinkResult> | null,
  formData: FormData,
): Promise<ActionResult<CreateLinkResult>> {
  const input = {
    destinationUrl: formData.get("destinationUrl") as string,
    customSlug: (formData.get("customSlug") as string) || undefined,
    title: (formData.get("title") as string) || undefined,
  };
  return createShortLinkAction(input);
}

export function CreateLinkForm() {
  const [state, action, isPending] = useActionState(formAction, initialState);

  return (
    <form
      action={action}
      className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label
          htmlFor="destinationUrl"
          className="block text-sm font-medium text-ink"
        >
          Destination URL <span className="text-red-500">*</span>
        </label>
        <input
          id="destinationUrl"
          name="destinationUrl"
          type="url"
          required
          placeholder="https://example.com/your-long-url"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="customSlug"
            className="block text-sm font-medium text-ink"
          >
            Custom Slug <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="customSlug"
            name="customSlug"
            type="text"
            placeholder="my-custom-slug"
            minLength={5}
            maxLength={32}
            pattern="[a-zA-Z0-9_-]+"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
          />
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-ink">
            Title <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="My Link"
            maxLength={200}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center rounded-md bg-cyan px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan/90 focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 disabled:opacity-50"
      >
        {isPending ? "Creating..." : "Shorten URL"}
      </button>

      {state && !state.ok && (
        <div
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-red-700"
        >
          {state.error.message}
        </div>
      )}

      {state?.ok && (
        <div
          role="status"
          className="rounded-md bg-green-50 p-3 text-sm text-green-700"
        >
          <p className="font-medium">Link created!</p>
          <p className="mt-1 break-all font-mono text-xs">
            {state.data.shortUrl}
          </p>
        </div>
      )}
    </form>
  );
}
