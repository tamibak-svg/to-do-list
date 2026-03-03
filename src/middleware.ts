import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Runs on every request BEFORE the page renders.
 *
 * Two responsibilities:
 *  1. Refresh the Supabase access token when it expires (mandatory for @supabase/ssr).
 *  2. Redirect unauthenticated users away from /tasks.
 *
 * IMPORTANT: Do NOT add any logic between createServerClient and
 * supabase.auth.getUser(). The cookie exchange must happen atomically.
 */
export async function middleware(request: NextRequest) {
  // Start with a plain "continue" response so we can attach refreshed cookies.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options?: CookieOptions }[]
        ) {
          // Write cookies to the *request* so Server Components see them...
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // ...and to the *response* so the browser stores them.
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Calling getUser() here is what triggers the token refresh.
  // Never skip this call or move it below conditional logic.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /tasks — redirect to /login if not authenticated.
  if (!user && request.nextUrl.pathname.startsWith("/tasks")) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from /login and /signup.
  if (
    user &&
    (request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname.startsWith("/signup"))
  ) {
    const tasksUrl = request.nextUrl.clone();
    tasksUrl.pathname = "/tasks";
    return NextResponse.redirect(tasksUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - public assets (svg, png, jpg, …)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
