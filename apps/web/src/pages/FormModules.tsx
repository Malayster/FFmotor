import React, { useState } from "react";

type Result = { ok: boolean; text: string };

async function send(endpoint: string, body: Record<string, unknown>): Promise<Result> {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok && data.success !== false && data.ok !== false, text: data.message || (res.ok ? "Direkod." : "Ditolak.") };
  } catch {
    return { ok: false, text: "Pelayan tidak menjawab." };
  }
}

const Field = ({ label, value, set, type = "text" }: { label: string; value: string; set: (v: string) => void; type?: string }) => (
  <label className="block text-xs font-bold text-zinc-800">
    {label}
    <input className="mt-1 w-full rounded-xl border-2 border-zinc-300 px-3 py-2 text-sm" type={type} value={value} onChange={(e) => set(e.target.value)} required />
  </label>
);

export const FormModules: React.FC<{ tab: string }> = ({ tab }) => {
  const [result, setResult] = useState<Result | null>(null);
  const [plate, setPlate] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");

  const forms: Record<string, { title: string; onSubmit: () => Promise<Result> }> = {
    "express-intake": {
      title: "Daftar motor masuk",
      onSubmit: () => send("/api/vehicles", { plateNumber: plate, ownerName: name, ownerPhone: phone, brand: "Yamaha", model: note || "Tidak dinyatakan" }),
    },
    "work-orders": {
      title: "Kad kerja",
      onSubmit: () => send("/api/work-orders", { plateNumber: plate, customerComplaint: note, ownerName: name, ownerPhone: phone }),
    },
    "pit-live": {
      title: "Kemas kini bay",
      onSubmit: () => send("/api/public/bays", { bay: Number(amount || 1), plate, serviceType: note || "Servis am" }),
    },
    "pos-checkout": {
      title: "Jualan kaunter",
      onSubmit: () => send("/api/sales", { plate, name, phone, amount: Number(amount || 0), note }),
    },
    quotations: {
      title: "Sebut harga",
      onSubmit: () => send("/api/quotations", { customerName: name, customerPhone: phone, note, plate }),
    },
    leads: {
      title: "Prospek",
      onSubmit: () => send("/api/leads", { customerName: name, customerPhone: phone, targetItem: note, type: "service_maintenance" }),
    },
    inbox: {
      title: "Mesej pelanggan",
      onSubmit: () => send("/api/inbox/messages", { customerPhone: phone, message: note, customerName: name }),
    },
    "owner-arahan": {
      title: "Arahan staf",
      onSubmit: () => send("/api/owner/arahan", { title: name, detail: note, targetRole: "kerani_1" }),
    },
    "bike-locks": {
      title: "Kunci unit",
      onSubmit: () => send("/api/locks", { plate, customerName: name, customerPhone: phone, note }),
    },
    inventory: {
      title: "Pergerakan stok",
      onSubmit: () => send("/api/products/movements", { sku: plate, movement: name, qty: Number(amount || 0), documentRef: phone, note }),
    },
  };

  const form = forms[tab];
  if (!form) return null;

  return (
    <form
      className="mb-4 space-y-3 rounded-2xl border-2 border-red-600 bg-white p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setResult(await form.onSubmit());
      }}
    >
      <h2 className="text-lg font-black text-zinc-950">{form.title}</h2>
      {tab === "inventory" && (
        <div className="flex flex-wrap gap-2">
          {["Terima stok", "Pindah stok", "Guna stok", "Stok rosak", "Stok bermasalah", "Return"].map((label) => (
            <button key={label} type="button" className="rounded-xl border-2 border-zinc-950 px-3 py-1.5 text-xs font-black" onClick={() => setName(label)}>{label}</button>
          ))}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nama" value={name} set={setName} />
        <Field label="Telefon" value={phone} set={setPhone} />
        <Field label="Plat" value={plate} set={setPlate} />
        <Field label="Amaun atau bay" value={amount} set={setAmount} />
      </div>
      <Field label="Nota" value={note} set={setNote} />
      <button className="rounded-xl bg-zinc-950 px-4 py-2 text-xs font-black uppercase text-white" type="submit">Hantar</button>
      {result && <p className={`text-sm font-bold ${result.ok ? "text-emerald-700" : "text-red-700"}`}>{result.text}</p>}
    </form>
  );
};
