"use client";

import { useState } from "react";
import { LucideMessageCircle, LucideX, LucideSend } from "lucide-react";
import clsx from "clsx";
import { toast } from "react-hot-toast";

interface Wiadomosc {
  rola: "user" | "ai";
  tresc: string;
}

export default function ChatAssistant() {
  const [widoczny, setWidoczny] = useState(false);
  const [wiadomosci, setWiadomosci] = useState<Wiadomosc[]>([]);
  const [input, setInput] = useState("");
  const [ostatniaOdpowiedz, setOstatniaOdpowiedz] = useState<string | null>(
    null
  );

  const wyciagnijNazweIKalorie = (tekst: string) => {
    const kcalMatch = tekst.match(
      /(?:Łączna kaloryczność .*?|suma kalorii.*?) to około (\d+)\s*kcal/i
    );
    const nazwaMatch = tekst.match(/Ile kalorii ma (.+?)\?/i);
    if (!kcalMatch || !nazwaMatch) return null;

    return {
      nazwa: nazwaMatch[1].trim(),
      kcal: parseInt(kcalMatch[1]),
    };
  };

  const dodajPosilekZCzatu = async () => {
    if (!ostatniaOdpowiedz) return;

    const dane = wyciagnijNazweIKalorie(ostatniaOdpowiedz);
    if (!dane) {
      toast.error("Nie udało się rozpoznać danych.");
      return;
    }

    const data = new Date().toISOString().split("T")[0];

    try {
      await fetch("/api/posilki", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nazwa: dane.nazwa,
          kcalRazem: dane.kcal,
          data,
          waga: null,
          kcalNa100g: null,
        }),
      });

      toast.success(`✅ Dodano: ${dane.nazwa} (${dane.kcal} kcal)`);
    } catch (err) {
      console.error("Błąd zapisu:", err);
      toast.error("❌ Nie udało się zapisać posiłku.");
    }
  };

  const wyslij = async () => {
    if (!input.trim()) return;

    const nowaWiadomosc: Wiadomosc = { rola: "user", tresc: input };
    setWiadomosci((prev) => [...prev, nowaWiadomosc]);
    setInput("");
    setOstatniaOdpowiedz(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      const odpowiedzAI: Wiadomosc = {
        rola: "ai",
        tresc: data.answer,
      };

      setWiadomosci((prev) => [...prev, odpowiedzAI]);
      setOstatniaOdpowiedz(data.answer);
    } catch (err) {
      console.error("Błąd przy wysyłaniu", err);
    }
  };

  return (
    <>
      {/* Przycisk otwierający */}
      <button
        className="btn btn-circle fixed bottom-4 right-4 z-50 bg-primary text-white shadow-xl hover:scale-110 transition-transform"
        onClick={() => setWidoczny(!widoczny)}
      >
        {widoczny ? <LucideX /> : <LucideMessageCircle />}
      </button>

      {/* Okno czatu */}
      <div
        className={clsx(
          "fixed bottom-24 right-4 w-96 max-h-[75vh] bg-base-200 border border-base-300 shadow-2xl rounded-2xl z-50 flex flex-col transition-all duration-300",
          !widoczny && "hidden"
        )}
      >
        {/* Pasek tytułu */}
        <div className="p-4 border-b border-base-300 font-semibold text-base-content bg-base-100 rounded-t-2xl">
          🍽️ Asystent kalorii
        </div>

        {/* Wiadomości */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 text-sm">
          {wiadomosci.map((msg, idx) => (
            <div
              key={idx}
              className={clsx(
                "p-3 rounded-xl max-w-[80%]",
                msg.rola === "user"
                  ? "bg-primary text-white ml-auto"
                  : "bg-base-100 text-base-content"
              )}
            >
              {msg.tresc}
            </div>
          ))}

          {/* Przycisk dodania posiłku */}
          {ostatniaOdpowiedz && wyciagnijNazweIKalorie(ostatniaOdpowiedz) && (
            <div className="mt-2">
              <button
                onClick={dodajPosilekZCzatu}
                className="btn btn-success btn-sm"
              >
                ✅ Dodaj: {wyciagnijNazweIKalorie(ostatniaOdpowiedz)?.nazwa} –{" "}
                {wyciagnijNazweIKalorie(ostatniaOdpowiedz)?.kcal} kcal
              </button>
            </div>
          )}
        </div>

        {/* Pole input + przycisk */}
        <div className="p-3 border-t border-base-300 bg-base-100 rounded-b-2xl flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && wyslij()}
            placeholder="Zadaj pytanie o kalorie..."
            className="input input-sm input-bordered w-full"
          />
          <button
            className="btn btn-sm btn-primary btn-square"
            onClick={wyslij}
            title="Wyślij"
          >
            <LucideSend size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
