"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CalendarDays, Trash2, Plus, Weight } from "lucide-react";

type PomiarWagi = {
  id?: string;
  data: string;
  waga: number;
};

export default function WagaTracker() {
  const [data, ustawDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [waga, ustawWage] = useState<number | null>(null);
  const [czyLaduje, ustawLadowanie] = useState(false);
  const [pomiary, ustawPomiary] = useState<PomiarWagi[]>([]);
  const [widoczne, setWidoczne] = useState(10);

  const pobierzPomiary = async () => {
    const res = await fetch("/api/waga");
    const dane = await res.json();
    const posortowane = dane.sort((a: PomiarWagi, b: PomiarWagi) =>
      b.data.localeCompare(a.data)
    );
    ustawPomiary(posortowane);
  };

  useEffect(() => {
    pobierzPomiary();
  }, []);

  const dodajPomiar = async () => {
    if (!waga || !data) return;

    ustawLadowanie(true);
    await fetch("/api/waga", {
      method: "POST",
      body: JSON.stringify({ data, waga }),
      headers: { "Content-Type": "application/json" },
    });
    ustawWage(null);
    await pobierzPomiary();
    ustawLadowanie(false);
  };

  const usunPomiar = async (id: string, data: string) => {
    const potwierdzenie = window.confirm(
      "Czy na pewno chcesz usunąć ten wpis?"
    );
    if (!potwierdzenie) return;

    await fetch(`/api/waga?id=${id}&data=${data}`, {
      method: "DELETE",
    });
    pobierzPomiary();
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center flex items-center justify-center gap-2">
        <Weight className="w-6 h-6" /> Waga – śledzenie zmian
      </h1>

      <div className="card bg-base-200 shadow-lg p-6 space-y-4">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text flex gap-2 items-center font-medium">
              <CalendarDays className="w-4 h-4" /> Data
            </span>
          </label>
          <input
            type="date"
            className="input input-bordered w-full"
            value={data}
            onChange={(e) => ustawDate(e.target.value)}
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text flex gap-2 items-center font-medium">
              <Weight className="w-4 h-4" /> Waga (kg)
            </span>
          </label>
          <input
            type="number"
            className="input input-bordered w-full"
            value={waga ?? ""}
            onChange={(e) => ustawWage(Number(e.target.value))}
            placeholder="np. 125.4"
          />
        </div>

        <button
          className="btn btn-primary btn-block flex gap-2 items-center justify-center"
          onClick={dodajPomiar}
          disabled={czyLaduje}
        >
          <Plus className="w-4 h-4" />
          {czyLaduje ? "Dodawanie..." : "Dodaj pomiar"}
        </button>
      </div>

      {pomiary.length > 0 ? (
        <>
          <div className="card bg-base-100 shadow-md p-4">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Trend wagi
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[...pomiary].reverse()}>
                <XAxis dataKey="data" />
                <YAxis domain={["auto", "auto"]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="waga"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="collapse collapse-arrow bg-base-100 shadow-md">
            <input type="checkbox" />
            <div className="collapse-title text-xl font-semibold">
              Historia wag
            </div>
            <div className="collapse-content">
              <div
                className="overflow-y-auto max-h-[400px]"
                onScroll={(e) => {
                  const { scrollTop, scrollHeight, clientHeight } =
                    e.currentTarget;
                  if (scrollTop + clientHeight >= scrollHeight - 10) {
                    setWidoczne((prev) => prev + 10);
                  }
                }}
              >
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Waga (kg)</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pomiary.slice(0, widoczne).map((p) => (
                      <tr key={p.id}>
                        <td>{p.data}</td>
                        <td>{p.waga}</td>
                        <td>
                          <button
                            onClick={() => usunPomiar(p.id!, p.data)}
                            className="btn btn-ghost btn-xs text-error"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-400">Brak danych do wyświetlenia</p>
      )}
    </div>
  );
}
