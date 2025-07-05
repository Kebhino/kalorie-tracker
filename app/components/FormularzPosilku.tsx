"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";

type Posilek = {
  nazwa: string;
  kalorie: number;
};

export default function FormularzPosilku({
  dodajPosilek,
}: {
  dodajPosilek: (posilek: Posilek) => void;
}) {
  const { register, handleSubmit, reset } = useForm<Posilek>();
  const [czyLaduje, ustawLadowanie] = useState(false);

  const wyslij = (dane: Posilek) => {
    ustawLadowanie(true);
    dodajPosilek(dane);
    reset();
    ustawLadowanie(false);
  };

  return (
    <form onSubmit={handleSubmit(wyslij)} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Nazwa posiłku</span>
        </label>
        <input
          {...register("nazwa", { required: true })}
          placeholder="np. Śniadanie"
          className="input input-bordered w-full"
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Kalorie</span>
        </label>
        <input
          type="number"
          {...register("kalorie", { required: true, valueAsNumber: true })}
          placeholder="np. 400"
          className="input input-bordered w-full"
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={czyLaduje}
      >
        {czyLaduje ? "Dodawanie..." : " Dodaj posiłek"}
      </button>
    </form>
  );
}
