/**
 * Turns a failed admin API response into a message worth showing a user.
 *
 * A 401 specifically means the admin's session expired mid-edit — the raw
 * `{ error: "Unauthorized" }` the API returns is meaningless to a human and
 * gives no next step. Everything else falls back to whatever message the
 * route provided, or a generic fallback.
 */
export async function readAdminApiError(res: Response, fallback: string): Promise<string> {
  if (res.status === 401) {
    return "Your session has expired. Please log in again to continue.";
  }
  const data = await res.json().catch(() => null);
  return (data && typeof data.error === "string" && data.error) || fallback;
}
