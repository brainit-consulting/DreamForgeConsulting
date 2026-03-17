import { redirect } from "next/navigation";

export default function Home() {
  // Middleware handles auth + role routing, so just redirect to dashboard
  // Unauthenticated users will be caught by middleware → /login
  // CLIENT users will be caught by middleware → /portal
  redirect("/dashboard");
}
