import React, { useState } from "react";

const JOBS = ["Servis berkala", "Brek", "Tali sawat", "Elektrik", "Aduan lain"];
const FAULTS = ["Brek lemah", "Minyak hitam", "Bunyi enjin", "Lampu rosak", "Tayar haus"];

export const ForemanJob: React.FC = () => {
  const [plate, setPlate] = useState("");
  const [job, setJob] = useState(JOBS[0]);
  const [faults, setFaults] = useState<string[]>([]);
  const [part, setPart] = useState("");
  const [note, setNote] = useState("");

  const toggle = (item: string) => {
    setFaults((curr) => curr.includes(item) ? curr.filter((x) => x !== item) : [...curr, item]);
  };

  return (
    <form className="mx-auto max-w-md space-y-4 rounded-3xl border-2 border-zinc-950 bg-white p-4" onSubmit={(e) => { e.preventDefault(); setNote("Disimpan sebagai permintaan. Bukan resit. Kerani semak stok dan harga."); }}>
      <header>
        <p className="text-[11px] font-black uppercase text-red-600">Foreman</p>
        <h1 className="text-2xl font-black text-zinc-950">Kerja di lantai</h1>
        <p className="text-xs font-bold text-zinc-800">Gambar, kerosakan, dan alat. Tiada harga dan tiada resit.</p>
      </header>
      <label className="block text-xs font-bold text-zinc-950">Plat
        <input className="mt-1 w-full rounded-xl border-2 border-zinc-300 bg-white px-3 py-3 text-lg font-black text-zinc-950 outline-none focus:border-zinc-950" value={plate} onChange={(e) => setPlate(e.target.value)} required />
      </label>
      <label className="block text-xs font-bold text-zinc-950">Jenis kerja
        <select className="mt-1 w-full rounded-xl border-2 border-zinc-300 bg-white px-3 py-3 text-sm font-bold text-zinc-950 outline-none focus:border-zinc-950" value={job} onChange={(e) => setJob(e.target.value)}>
          {JOBS.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <fieldset className="space-y-2">
        <legend className="text-xs font-bold">Kerosakan</legend>
        {FAULTS.map((item) => (
          <label key={item} className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={faults.includes(item)} onChange={() => toggle(item)} /> {item}
          </label>
        ))}
      </fieldset>
      <label className="block text-xs font-bold text-zinc-950">Alat dari rak
        <input className="mt-1 w-full rounded-xl border-2 border-zinc-300 bg-white px-3 py-3 text-sm font-bold text-zinc-950 outline-none focus:border-zinc-950" value={part} onChange={(e) => setPart(e.target.value)} placeholder="Nama alat, bukan harga" required />
      </label>
      <label className="block text-xs font-bold text-zinc-950">Gambar masuk atau siap
        <input className="mt-1 w-full text-sm font-bold text-zinc-950" type="file" accept="image/*" capture="environment" required />
      </label>
      <button className="w-full rounded-2xl bg-zinc-950 py-3 text-sm font-black uppercase text-white" type="submit">Hantar kepada kerani</button>
      {note && <p className="text-sm font-bold text-emerald-700">{note}</p>}
    </form>
  );
};
