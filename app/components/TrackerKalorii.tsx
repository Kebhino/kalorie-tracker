"use client";

import { useEffect, useState } from "react";

type Posilek = {
  id?: string;
  nazwa: string;
  kalorie: number;
  data: string;
};

export default function TrackerKalorii() {
  const [posilki, ustawPosilki] = useState<Posilek[]>([]);
  const [nazwa, ustawNazwe] = useState("");
  const [kalorie, ustawKalorie] = useState<number>(0);
  const [data, ustawDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [czyLaduje, ustawLadowanie] = useState(false);

  const pobierzPosilki = async () => {
    const res = await fetch(`/api/posilki?data=${data}`);
    const dane = await res.json();
    ustawPosilki(dane);
  };

  useEffect(() => {
    pobierzPosilki();
  }, [data]);

  const dodajPosilek = async () => {
    ustawLadowanie(true);
    await fetch("/api/posilki", {
      method: "POST",
      body: JSON.stringify({ nazwa, kalorie, data }),
      headers: { "Content-Type": "application/json" },
    });
    ustawNazwe("");
    ustawKalorie(0);
    await pobierzPosilki();
    ustawLadowanie(false);
  };

  const sumaKalorii = posilki.reduce((suma, p) => suma + p.kalorie, 0);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center"> Dziennik kalorii</h1>

      <div className="card bg-base-200 shadow-lg p-6 space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Data</span>
          </label>
          <input
            type="date"
            value={data}
            onChange={(e) => ustawDate(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Nazwa posiłku</span>
          </label>
          <input
            value={nazwa}
            onChange={(e) => ustawNazwe(e.target.value)}
            placeholder="np. Obiad"
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Kalorie</span>
          </label>
          <input
            type="number"
            value={kalorie}
            onChange={(e) => ustawKalorie(Number(e.target.value))}
            placeholder="np. 500"
            className="input input-bordered w-full"
          />
        </div>

        <button
          onClick={dodajPosilek}
          className="btn btn-primary w-full"
          disabled={czyLaduje}
        >
          {czyLaduje ? "Dodawanie..." : "➕ Dodaj posiłek"}
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">🍽️ Posiłki ({data}):</h2>

        {posilki.length === 0 ? (
          <p className="text-gray-400">Brak posiłków na ten dzień</p>
        ) : (
          <ul className="space-y-2">
            {posilki.map((p) => (
              <li
                key={p.id}
                className="card bg-neutral text-neutral-content p-4"
              >
                <div className="flex justify-between">
                  <span>{p.nazwa}</span>
                  <span>{p.kalorie} kcal</span>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="font-bold text-center mt-4">
          🔥 Suma kalorii: {sumaKalorii} kcal
        </p>
      </div>
    </div>
  );
}
