'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';

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
      <input
        {...register('nazwa', { required: true })}
        placeholder="Nazwa posiłku"
        className="w-full border rounded p-2"
      />
      <input
        type="number"
        {...register('kalorie', { required: true, valueAsNumber: true })}
        placeholder="Kalorie"
        className="w-full border rounded p-2"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        disabled={czyLaduje}
      >
        Dodaj
      </button>
    </form>
  );
}

