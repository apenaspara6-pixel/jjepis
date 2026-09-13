import { endAdminSession } from "@/lib/admin-auth";
import { sameOrigin, fail } from "@/lib/security";
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const cookie = await endAdminSession(req);
    return new Response(null, {
      status: 303,
      headers: {
        Location: "/admin",
        "Set-Cookie": cookie,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return fail(e);
  }
}
