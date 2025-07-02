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
import {
  CalendarDays,
  Trash2,
  Plus,
  Weight,
  GripVertical,
  Info,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const Sekcje = {
  Formularz: "formularz",
  Trend: "trend",
  Historia: "historia",
  Statystyki: "statystyki",
} as const;

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
  const [kolejnosc, ustawKolejnosc] = useState<string[]>([
    Sekcje.Formularz,
    Sekcje.Statystyki,
    Sekcje.Trend,
    Sekcje.Historia,
  ]);

  const sensors = useSensors(useSensor(PointerSensor));

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

  function SortowalnaSekcja({
    id,
    children,
  }: {
    id: string;
    children: React.ReactNode;
  }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-[420px] card bg-base-100 shadow-md p-4 flex flex-col"
      >
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab flex items-center gap-2 text-gray-400 mb-2"
        >
          <GripVertical className="w-4 h-4" /> Przeciągnij
        </div>
        {children}
      </div>
    );
  }

  const pierwsza = pomiary.at(-1)?.waga;
  const ostatnia = pomiary.at(0)?.waga;
  const roznica = pierwsza && ostatnia ? (pierwsza - ostatnia).toFixed(1) : "-";
  const dni =
    pomiary.length >= 2
      ? (new Date(pomiary[0].data).getTime() -
          new Date(pomiary.at(-1)!.data).getTime()) /
        86400000
      : 0;
  const tygodniowo = dni > 0 ? ((Number(roznica) / dni) * 7).toFixed(1) : "-";
  const procent =
    pierwsza && ostatnia
      ? (((pierwsza - ostatnia) / pierwsza) * 100).toFixed(1)
      : "-";
  const bmi = ostatnia ? (ostatnia / Math.pow(1.89, 2)).toFixed(1) : "-";
  const bmiOpis = ostatnia
    ? (() => {
        const val = parseFloat(bmi);
        if (val < 18.5) return "Niedowaga";
        if (val < 25) return "Prawidłowa masa ciała";
        if (val < 30) return "Nadwaga";
        return "Otyłość";
      })()
    : "-";

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-4">
      <h1 className="text-3xl font-bold text-center flex items-center justify-center gap-2 mb-2">
        <Weight className="w-6 h-6" /> Waga – śledzenie zmian
      </h1>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (active.id !== over?.id) {
            const stara = kolejnosc.indexOf(active.id as string);
            const nowa = kolejnosc.indexOf(over?.id as string);
            ustawKolejnosc(arrayMove(kolejnosc, stara, nowa));
          }
        }}
      >
        <SortableContext
          items={kolejnosc}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid md:grid-cols-2 gap-6 auto-rows-[1fr]">
            {kolejnosc.map((sekcja) => {
              if (sekcja === Sekcje.Formularz)
                return (
                  <SortowalnaSekcja key={sekcja} id={sekcja}>
                    <div className="space-y-4 flex flex-col h-full">
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
                        className="btn btn-primary btn-block flex gap-2 items-center justify-center mt-auto"
                        onClick={dodajPomiar}
                        disabled={czyLaduje}
                      >
                        <Plus className="w-4 h-4" />
                        {czyLaduje ? "Dodawanie..." : "Dodaj pomiar"}
                      </button>
                    </div>
                  </SortowalnaSekcja>
                );

              if (sekcja === Sekcje.Statystyki)
                return (
                  <SortowalnaSekcja key={sekcja} id={sekcja}>
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold mb-2 flex gap-2 items-center">
                        <Info className="w-5 h-5" /> Statystyki
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        <div className="badge badge-outline">
                          Miesięczny spadek:{" "}
                          <strong className="ml-1">{roznica} kg</strong>
                        </div>
                        <div className="badge badge-outline">
                          Tygodniowo:{" "}
                          <strong className="ml-1">{tygodniowo} kg</strong>
                        </div>
                        <div className="badge badge-outline">
                          Utrata masy:{" "}
                          <strong className="ml-1">{procent} %</strong>
                        </div>
                        <div className="badge badge-outline">
                          BMI: <strong className="ml-1">{bmi}</strong> –{" "}
                          {bmiOpis}
                        </div>
                      </div>
                    </div>
                  </SortowalnaSekcja>
                );

              if (sekcja === Sekcje.Trend)
                return (
                  <SortowalnaSekcja key={sekcja} id={sekcja}>
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
                  </SortowalnaSekcja>
                );

              if (sekcja === Sekcje.Historia)
                return (
                  <SortowalnaSekcja key={sekcja} id={sekcja}>
                    <h2 className="text-xl font-semibold mb-2">Historia wag</h2>
                    <div className="overflow-y-auto max-h-[300px]">
                      <table className="table table-zebra w-full">
                        <thead>
                          <tr>
                            <th>Data</th>
                            <th>Waga (kg)</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {pomiary.map((p) => (
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
                  </SortowalnaSekcja>
                );

              return null;
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
