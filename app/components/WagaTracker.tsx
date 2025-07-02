"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CalendarDays, Weight, Plus } from "lucide-react";

type PomiarWagi = {
  id?: string;
  data: string;
  waga: number;
};

export default function WagaTracker() {
  const [pomiarWagi, ustawPomiarWagi] = useState<PomiarWagi[]>([]);
  const [data, ustawDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [waga, ustawWage] = useState<number | undefined>();
  const [czyLaduje, ustawLadowanie] = useState(false);

  const pobierzWage = async () => {
    const res = await fetch("/api/waga");
    const dane = await res.json();
    ustawPomiarWagi(dane);
  };

  useEffect(() => {
    pobierzWage();
  }, []);

  const dodajWage = async () => {
    if (!waga || !data) return;

    ustawLadowanie(true);
    await fetch("/api/waga", {
      method: "POST",
      body: JSON.stringify({ data, waga }),
      headers: { "Content-Type": "application/json" },
    });

    ustawWage(undefined);
    await pobierzWage();
    ustawLadowanie(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center">📉 Tracker wagi</h1>

      <div className="card bg-base-200 shadow-lg p-8 space-y-6">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text flex items-center gap-2 font-medium">
              <CalendarDays className="w-4 h-4" /> Data
            </span>
          </label>
          <input
            type="date"
            value={data}
            onChange={(e) => ustawDate(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text flex items-center gap-2 font-medium">
              <Weight className="w-4 h-4" /> Waga (kg)
            </span>
          </label>
          <input
            type="number"
            value={waga ?? ""}
            onChange={(e) => ustawWage(Number(e.target.value))}
            className="input input-bordered w-full"
            placeholder="np. 127.5"
          />
        </div>

        <button
          onClick={dodajWage}
          disabled={czyLaduje}
          className="btn btn-primary btn-block flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {czyLaduje ? "Dodawanie..." : "Dodaj wagę"}
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">📈 Trend wagi:</h2>
        {pomiarWagi.length === 0 ? (
          <p className="text-gray-400">Brak danych do wyświetlenia</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={pomiarWagi}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis domain={["dataMin - 2", "dataMax + 2"]} unit=" kg" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="waga"
                stroke="#60a5fa"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
