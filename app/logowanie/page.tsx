"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";

export default function Logowanie() {
  const [email, setEmail] = useState("");
  const [haslo, setHaslo] = useState("");
  const [blad, setBlad] = useState("");

  const zaloguj = async () => {
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password: haslo,
    });

    if (res?.error) {
      setBlad("Nieprawidłowe dane logowania");
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-base-100">
      <div className="card w-full max-w-md bg-base-200 p-8 shadow-xl">
        <h2 className="text-2xl mb-4 font-bold text-center">Logowanie</h2>
        {blad && <div className="text-red-500 mb-4">{blad}</div>}
        <input
          type="email"
          placeholder="Email"
          className="input input-bordered w-full mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Hasło"
          className="input input-bordered w-full mb-4"
          value={haslo}
          onChange={(e) => setHaslo(e.target.value)}
        />
        <button onClick={zaloguj} className="btn btn-primary w-full">
          Zaloguj
        </button>
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="btn btn-outline w-full mt-2"
        >
          <Image
            src="/google-icon-logo-svgrepo-com.svg"
            alt="Logo Google"
            width={24}
            height={24}
          />
          Zaloguj przez Google
        </button>
      </div>
    </div>
  );
}
