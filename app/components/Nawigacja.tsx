"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nawigacja() {
  const pathname = usePathname();
  const { data: session } = useSession(); // 🔍 dodane

  return (
    <div className="navbar bg-base-100 shadow mb-6">
      <div className="container mx-auto flex justify-between px-4">
        <div className="flex space-x-4">
          <Link
            href="/"
            className={`btn btn-sm ${
              pathname === "/" ? "btn-primary" : "btn-ghost"
            }`}
          >
            🍽 Tracker kalorii
          </Link>
          <Link
            href="/waga"
            className={`btn btn-sm ${
              pathname === "/waga" ? "btn-primary" : "btn-ghost"
            }`}
          >
            ⚖️ Waga
          </Link>

          {session && (
            <button
              onClick={() => signOut({ callbackUrl: "/logowanie" })}
              className="btn btn-outline btn-error"
            >
              Wyloguj się
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
