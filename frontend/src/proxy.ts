import { withAuth } from "next-auth/middleware";

// Protect all routes under /dashboard
export default withAuth({
  pages: {
    signIn: "/",
  },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
