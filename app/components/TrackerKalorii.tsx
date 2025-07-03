"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Utensils,
  Weight,
  Flame,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react";

type Posilek = {
  id?: string;
  nazwa: string;
  data: string;
  waga: number;
  kcalNa100g: number;
  kcalRazem: number;
};

type AIPosilek = {
  produkty: {
    nazwa: string;
    waga: number;
    kcalNa100g: number;
    kcal: number;
  }[];
  kcalŁącznie: number;
};

export default function TrackerKalorii() {
  const [posilki, setPosilki] = useState<Posilek[]>([]);
  const [nazwa, ustawNazwe] = useState("");
  const [waga, ustawWage] = useState<number | undefined>();
  const [kcalNa100g, ustawKcalNa100g] = useState<number | undefined>();
  const [data, ustawDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [czyLaduje, ustawLadowanie] = useState(false);

  const [modalOtwarte, ustawModalOtwarte] = useState(false);
  const [idDoUsuniecia, ustawIdDoUsuniecia] = useState<string | null>(null);
  const [dataDoUsuniecia, ustawDateDoUsuniecia] = useState<string | null>(null);

  const [odAI, ustawOdAI] = useState<AIPosilek | null>(null);
  const [odpowiedz, ustawOdpowiedz] = useState<string>("");
  const [czyPrzetwarza, ustawCzyPrzetwarza] = useState(false);
  const [oknoAI, ustawOknoAI] = useState(false);
  const [tekstZapytania, ustawTekstZapytania] = useState("");

  const otworzModal = (id: string, data: string) => {
    ustawIdDoUsuniecia(id);
    ustawDateDoUsuniecia(data);
    ustawModalOtwarte(true);
  };

  const potwierdzUsuniecie = async () => {
    if (idDoUsuniecia && dataDoUsuniecia) {
      await fetch(`/api/posilki?id=${idDoUsuniecia}&data=${dataDoUsuniecia}`, {
        method: "DELETE",
      });
      await pobierzPosilki();
    }
    ustawModalOtwarte(false);
    ustawIdDoUsuniecia(null);
    ustawDateDoUsuniecia(null);
  };

  const pobierzPosilki = async () => {
    try {
      const res = await fetch(`/api/posilki?data=${data}`);
      const dane = await res.json();
      if (Array.isArray(dane)) {
        setPosilki(dane);
      } else {
        setPosilki([]);
      }
    } catch (err) {
      console.error("Błąd pobierania posiłków:", err);
      setPosilki([]);
    }
  };

  useEffect(() => {
    pobierzPosilki();
  }, [data]);

  const dodajPosilek = async () => {
    if (!nazwa || !waga || !kcalNa100g) return;
    const kcalRazem = Math.round((waga * kcalNa100g) / 100);
    ustawLadowanie(true);
    try {
      await fetch("/api/posilki", {
        method: "POST",
        body: JSON.stringify({ nazwa, waga, kcalNa100g, kcalRazem, data }),
        headers: { "Content-Type": "application/json" },
      });
      ustawNazwe("");
      ustawWage(undefined);
      ustawKcalNa100g(undefined);
      await pobierzPosilki();
    } catch (err) {
      console.error("Błąd dodawania posiłku:", err);
    } finally {
      ustawLadowanie(false);
    }
  };

  const sumaKalorii = posilki.reduce((suma, p) => suma + (p.kcalRazem || 0), 0);
  const zapotrzebowanie = 3000;
  const deficyt = zapotrzebowanie - sumaKalorii;

  const zapytajAI = async () => {
    if (!tekstZapytania.trim()) return;
    ustawCzyPrzetwarza(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: tekstZapytania }),
    });
    const dane = await res.json();
    ustawOdpowiedz(dane.answer);
    ustawOdAI(dane.meal);
    ustawCzyPrzetwarza(false);
  };

  const zapiszZChat = async () => {
    if (!odAI) return;
    const res = await fetch("/api/posilki/dodaj", {
      method: "POST",
      body: JSON.stringify({
        ...odAI,
        data: new Date().toISOString().split("T")[0],
      }),
    });
    if (res.ok) {
      ustawOdAI(null);
      ustawOdpowiedz("");
      ustawOknoAI(false);
      await pobierzPosilki();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center">Tracker kalorii</h1>

      <button
        onClick={() => ustawOknoAI(true)}
        className="btn btn-accent btn-block gap-2"
      >
        <Sparkles className="w-4 h-4" /> Zapytaj AI o kaloryczność posiłku
      </button>

      {oknoAI && (
        <dialog className="modal modal-open">
          <div className="modal-box space-y-4">
            <h2 className="font-bold text-lg">AI: Opisz swój posiłek</h2>

            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="np. 2 serki skyr, banan, 2 nektarynki"
              value={tekstZapytania}
              onChange={(e) => ustawTekstZapytania(e.target.value)}
            />

            <button
              onClick={zapytajAI}
              disabled={czyPrzetwarza}
              className="btn btn-primary btn-block"
            >
              {czyPrzetwarza ? "Analizuję..." : "Wyślij do AI"}
            </button>

            {odpowiedz && (
              <div className="bg-base-200 p-4 rounded-lg whitespace-pre-wrap">
                {odpowiedz}
              </div>
            )}

            {odAI && (
              <button
                onClick={zapiszZChat}
                className="btn btn-success btn-block"
              >
                <Plus className="w-4 h-4" /> Zapisz ten posiłek
              </button>
            )}

            <div className="modal-action">
              <button onClick={() => ustawOknoAI(false)} className="btn">
                Zamknij
              </button>
            </div>
          </div>
        </dialog>
      )}

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
              <Utensils className="w-4 h-4" /> Nazwa posiłku
            </span>
          </label>
          <input
            value={nazwa}
            onChange={(e) => ustawNazwe(e.target.value)}
            placeholder="np. Śniadanie"
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text flex items-center gap-2 font-medium">
              <Weight className="w-4 h-4" /> Waga (g)
            </span>
          </label>
          <input
            type="number"
            value={waga ?? ""}
            onChange={(e) => ustawWage(Number(e.target.value))}
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text flex items-center gap-2 font-medium">
              <Flame className="w-4 h-4" /> Kalorie na 100 g
            </span>
          </label>
          <input
            type="number"
            value={kcalNa100g ?? ""}
            onChange={(e) => ustawKcalNa100g(Number(e.target.value))}
            className="input input-bordered w-full"
          />
        </div>

        <button
          onClick={dodajPosilek}
          className="btn btn-primary btn-block mt-4 flex items-center justify-center gap-2"
          disabled={czyLaduje}
        >
          <Plus className="w-4 h-4" />
          {czyLaduje ? "Dodawanie..." : "Dodaj posiłek"}
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Posiłki ({data}):</h2>

        {posilki.length === 0 ? (
          <p className="text-gray-400">Brak posiłków na ten dzień</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Nazwa</th>
                  <th>Waga (g)</th>
                  <th>Kcal / 100g</th>
                  <th>Razem (kcal)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {posilki.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nazwa}</td>
                    <td>{p.waga}</td>
                    <td>{p.kcalNa100g}</td>
                    <td className="font-bold">{p.kcalRazem}</td>
                    <td>
                      <button
                        onClick={() => otworzModal(p.id!, p.data)}
                        className="btn btn-ghost btn-xs text-error"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="text-right font-semibold">
                    Suma:
                  </td>
                  <td className="font-bold">{sumaKalorii} kcal</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <div className="mt-4 text-center">
          <p className="text-sm">Zapotrzebowanie: {zapotrzebowanie} kcal</p>
          {deficyt >= 0 ? (
            <p className="text-lg font-bold text-green-600">
              Deficyt: {deficyt} kcal
            </p>
          ) : (
            <p className="text-lg font-bold text-red-600">
              Nadwyżka: {Math.abs(deficyt)} kcal
            </p>
          )}
        </div>
      </div>

      {modalOtwarte && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Potwierdzenie</h3>
            <p className="py-4">Czy na pewno chcesz usunąć ten posiłek?</p>
            <div className="modal-action">
              <button onClick={potwierdzUsuniecie} className="btn btn-error">
                Usuń
              </button>
              <button
                onClick={() => ustawModalOtwarte(false)}
                className="btn btn-ghost"
              >
                Anuluj
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
