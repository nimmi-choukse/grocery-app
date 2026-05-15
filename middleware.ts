import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  isUserRole,
  ROLE_HOME_PATHS,
  ROLE_PROTECTED_PREFIXES,
  type UserRole,
} from "@/types/auth";

async function getProfileRole(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
): Promise<UserRole | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  return isUserRole(profile?.role) ? profile.role : null;
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname === "/auth" || pathname.startsWith("/auth/");

  if (user) {
    const role = await getProfileRole(supabase, user.id);

    if (isAuthRoute && role) {
      const url = request.nextUrl.clone();
      url.pathname = ROLE_HOME_PATHS[role];
      url.search = "";
      return NextResponse.redirect(url);
    }

    for (const [prefix, requiredRole] of Object.entries(
      ROLE_PROTECTED_PREFIXES,
    )) {
      if (!pathname.startsWith(prefix)) continue;

      if (role !== requiredRole) {
        const url = request.nextUrl.clone();
        url.pathname = role ? ROLE_HOME_PATHS[role] : "/auth";
        url.search = role ? "" : `?role=${requiredRole}`;
        return NextResponse.redirect(url);
      }
    }
  } else {
    for (const [prefix, requiredRole] of Object.entries(
      ROLE_PROTECTED_PREFIXES,
    )) {
      if (!pathname.startsWith(prefix)) continue;

      const url = request.nextUrl.clone();
      url.pathname = "/auth";
      url.search = `?role=${requiredRole}`;
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
