"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Nawigacja() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null; // 👈 zapobiega hydration error

  return (
    <div className="navbar bg-base-100 shadow mb-6">
      <div className="container mx-auto flex justify-between items-center px-4">
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
        </div>

        {session?.user && (
          <div className="flex items-center gap-3">
            <Image
              src={session.user.image || "/placeholder.jpg"}
              alt="Avatar"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-sm">
              <strong>{session.user.name}</strong>
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/logowanie" })}
              className="btn btn-sm btn-outline"
            >
              Wyloguj
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
