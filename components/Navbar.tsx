"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="navbar">
      <Link href="/" className="brand">ZitateApp</Link>
      <div className="nav-links">
        {session ? (
          <>
            <Link href="/" className="nav-link">Feed</Link>
            {/* @ts-ignore */}
            <Link href={`/profile/${session.user?.id}`} className="nav-link">Mein Profil</Link>
            <button onClick={() => signOut()} className="btn btn-secondary">Logout</button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn btn-secondary">Login</Link>
            <Link href="/register" className="btn btn-primary">Registrieren</Link>
          </>
        )}
      </div>
    </nav>
  );
}
