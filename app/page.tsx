"use client";

import FormularzPosilku from "./components/FormularzPosilku";
import { useState } from "react";

type Posilek = {
  nazwa: string;
  kalorie: number;
};

export default function StronaGlowna() {
  const [posilki, ustawPosilki] = useState<Posilek[]>([]);

  const dodajPosilek = (nowyPosilek: Posilek) => {
    ustawPosilki((poprzednie) => [...poprzednie, nowyPosilek]);
  };

  const sumaKalorii = posilki.reduce(
    (suma, posilek) => suma + posilek.kalorie,
    0
  );

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">Dziennik kalorii 🍽️</h1>

      <FormularzPosilku dodajPosilek={dodajPosilek} />

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Dzisiejsze posiłki:</h2>
        {posilki.length === 0 ? (
          <p className="text-gray-500 mt-2">Brak dodanych posiłków</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {posilki.map((posilek, index) => (
              <li key={index} className="border p-2 rounded">
                {posilek.nazwa} – {posilek.kalorie} kcal
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 font-bold text-lg">
          🔥 Łączna liczba kalorii: {sumaKalorii} kcal
        </p>
      </section>
    </main>
  );
}
