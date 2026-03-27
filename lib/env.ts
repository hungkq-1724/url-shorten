import { z } from "zod";

const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  APP_BASE_URL: z.string().url(),
  CONTEXT7_MCP_URL: z.string().url().optional(),
  CONTEXT7_MCP_TOKEN: z.string().min(1).optional(),
  CONTEXT7_ENRICHMENT_ENABLED: z
    .enum(["true", "false"])
    .optional()
    .default("false"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

type ServerEnv = z.infer<typeof serverSchema>;
type ClientEnv = z.infer<typeof clientSchema>;

function formatIssuePath(path: (string | number)[]): string {
  return path.join(".") || "<root>";
}

function panicInvalidEnv(issues: z.ZodIssue[]): never {
  const lines = issues.map((issue) => {
    const key = formatIssuePath(issue.path);
    return `- ${key}: ${issue.message}`;
  });

  throw new Error(`Invalid environment variables:\n${lines.join("\n")}`);
}

const clientParsed = clientSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

if (!clientParsed.success) {
  panicInvalidEnv(clientParsed.error.issues);
}

export const publicEnv: ClientEnv = clientParsed.data;

const isServer = typeof window === "undefined";
let serverData = {} as ServerEnv;

if (isServer) {
  const serverParsed = serverSchema.safeParse(process.env);
  if (!serverParsed.success) {
    panicInvalidEnv(serverParsed.error.issues);
  }
  serverData = serverParsed.data;
}

export const env: ServerEnv = serverData;

export function isContext7Enabled(): boolean {
  return env.CONTEXT7_ENRICHMENT_ENABLED === "true";
}
