import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// AI models are asked to return only a JSON object, but some (unlike the
// ones this was originally tested against) sometimes wrap it in prose first,
// e.g. "Here are the interview questions:\n\n{...}". Stripping markdown
// fences alone doesn't handle that - this pulls out the substring between
// the first "{" and the last "}" so a conversational preamble/postamble
// doesn't break JSON.parse.
export function extractJsonObject(text) {
  if (typeof text !== "string") return null;
  const withoutFences = text.replace(/```json|```/g, "").trim();
  const start = withoutFences.indexOf("{");
  const end = withoutFences.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  return withoutFences.slice(start, end + 1);
}
