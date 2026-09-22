import { mapKailopayUserToProfile } from "@/lib/kailopay/developer/profile";
import { getServerSession } from "@/lib/kailopay/session";

/**
 * Stub for legacy NextAuth SessionProvider used by the ported dashboard.
 */
export async function GET() {
  const session = await getServerSession();

  if (!session) {
    return Response.json(null);
  }

  const profile = mapKailopayUserToProfile(session);

  return Response.json({
    user: {
      name: profile.name,
      email: profile.email,
      image: profile.image,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
}
