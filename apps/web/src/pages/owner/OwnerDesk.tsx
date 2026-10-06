import React, { useEffect, useState } from "react";
import { fetchApi } from "../../lib/api";

type Row = { id: string; label: string; targetRole: string };
type Board = {
  wang: { hariIni: number; bulanIni: number };
  untung: { servis: number; alat: number; marginMotor: number; tuntutanDiterima: number; tuntutanBelum: number; komisenKeluar: number; bersih: number };
  masalah: Row[];
  tergendala: Row[];
  aktiviti: { at: string; text: string }[];
};

const rm = (n: number) => `RM ${(n || 0).toLocaleString("ms-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function roleLabel(role: string) {
  if (role === "kerani_1") return "kerani kaunter";
  if (role === "kerani_2") return "kerani stor";
  if (role === "foreman") return "foreman";
  if (role === "affiliate") return "jurujual";
  if (role === "owner") return "pemilik";
  return role;
}

async function hantar(row: Row) {
  await fetchApi("/owner/arahan", {
    method: "POST",
    body: JSON.stringify({ title: row.label, detail: row.label, targetRole: row.targetRole, source: "papan" }),
  });
}

export const OwnerBoard: React.FC = () => {
  const [board, setBoard] = useState<Board | null>(null);
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const [claim, setClaim] = useState({ distributor: "Yamaha", amount: "" });

  const load = () => {
    fetchApi<{ success: boolean } & Board>("/owner/board")
      .then((d) => { setBoard(d); setErr(""); })
      .catch((e) => setErr(e.message));
  };
  useEffect(() => { load(); }, []);

  const send = async (row: Row) => {
    await hantar(row);
    setNote(`Arahan dihantar kepada ${roleLabel(row.targetRole)}. Anda kekal di papan ini.`);
    load();
  };

  if (err) return <p className="text-sm font-bold text-red-800 bg-red-100 border-2 border-red-300 rounded-2xl p-4">{err}</p>;
  if (!board) return <p className="text-sm font-bold text-zinc-700">Memuat papan kedai…</p>;

  return (
    <div className="space-y-6 pb-12">
      <header>
        <p className="text-[11px] font-black uppercase tracking-wider text-red-600">Papan kedai</p>
        <h1 className="text-2xl font-black text-zinc-950">Pemilik nampak kedai, bukan borang kaunter</h1>
        {note && <p className="text-sm font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 p-2.5 rounded-xl mt-2">{note}</p>}
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <article className="bg-zinc-950 text-white rounded-2xl p-5 border-2 border-zinc-900 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wider text-zinc-300">Wang masuk hari ini</p>
          <p className="text-3xl font-black mt-1 text-white">{rm(board.wang.hariIni)}</p>
          <p className="text-xs text-zinc-300 font-bold mt-2">Bulan ini <span className="font-bold text-white">{rm(board.wang.bulanIni)}</span>. Tunai, DuitNow, dan jualan yang sudah direkod.</p>
        </article>
        <article className="bg-white border-2 border-zinc-200 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wider text-zinc-950">Untung bulan ini</p>
          <p className="text-3xl font-black text-zinc-950 mt-1">{rm(board.untung.bersih)}</p>
          <p className="text-xs text-zinc-800 font-bold mt-2">Servis {rm(board.untung.servis)} · alat ganti {rm(board.untung.alat)} · margin motor {rm(board.untung.marginMotor)} · tuntutan diterima {rm(board.untung.tuntutanDiterima)} · tolak komisen {rm(board.untung.komisenKeluar)}</p>
          <p className="text-xs text-red-700 font-bold mt-1">Tuntutan pengedar belum masuk bank: {rm(board.untung.tuntutanBelum)}. Tidak dikira untung.</p>
        </article>
      </section>

      <form className="bg-white border-2 border-zinc-200 rounded-2xl p-4 flex flex-wrap gap-2 items-end shadow-sm" onSubmit={async (e) => {
        e.preventDefault();
        await fetchApi("/owner/claims", { method: "POST", body: JSON.stringify({ distributor: claim.distributor, amount: Number(claim.amount) }) });
        setClaim({ ...claim, amount: "" });
        load();
      }}>
        <label className="text-xs font-bold text-zinc-800">Tuntutan pengedar
          <input className="mt-1 block border-2 border-zinc-300 text-zinc-950 font-bold rounded-xl px-3 py-2" value={claim.distributor} onChange={(e) => setClaim({ ...claim, distributor: e.target.value })} />
        </label>
        <label className="text-xs font-bold text-zinc-800">Amaun
          <input className="mt-1 block border-2 border-zinc-300 text-zinc-950 font-bold rounded-xl px-3 py-2 w-32" value={claim.amount} onChange={(e) => setClaim({ ...claim, amount: e.target.value })} />
        </label>
        <button className="bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-sm cursor-pointer active:scale-95" type="submit">Rekod belum diterima</button>
      </form>

      <TwoLists title="Masalah" rows={board.masalah} onSend={send} />
      <TwoLists title="Tergendala" rows={board.tergendala} onSend={send} />

      <section className="bg-white border-2 border-zinc-200 rounded-2xl p-5 shadow-sm">
        <h2 className="font-black text-zinc-950 text-base">Aktiviti</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {board.aktiviti.length === 0 && <li className="text-zinc-950 font-bold">Belum ada pergerakan direkod.</li>}
          {board.aktiviti.map((a, i) => (
            <li key={i} className="flex justify-between gap-3 border-b-2 border-zinc-100 pb-2">
              <span className="font-bold text-zinc-950">{a.text}</span>
              <span className="text-zinc-950 font-mono font-bold shrink-0">{a.at.slice(0, 16).replace("T", " ")}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

const TwoLists: React.FC<{ title: string; rows: Row[]; onSend: (row: Row) => void }> = ({ title, rows, onSend }) => (
  <section className="bg-white border-2 border-zinc-200 rounded-2xl p-5 shadow-sm">
    <h2 className="font-black text-zinc-950 text-base">{title}</h2>
    <ul className="mt-3 space-y-2">
      {rows.length === 0 && <li className="text-sm text-zinc-950 font-bold">Tiada.</li>}
      {rows.map((row) => (
        <li key={row.id} className="flex items-center justify-between gap-3 text-sm border-2 border-zinc-200 rounded-xl px-3 py-2 bg-zinc-50">
          <span className="font-bold text-zinc-900">{row.label}</span>
          {row.targetRole === "owner" ? (
            <span className="text-xs font-bold text-zinc-700 bg-zinc-200 px-2 py-0.5 rounded-md">Kekal pada pemilik</span>
          ) : (
            <button type="button" className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg px-3 py-1.5 transition shadow-sm cursor-pointer active:scale-95" onClick={() => onSend(row)}>
              Hantar ke {roleLabel(row.targetRole)}
            </button>
          )}
        </li>
      ))}
    </ul>
  </section>
);

type Bike = { id: string; brand: string; model: string; condition: string; chassisNo: string; plateNumber?: string | null; costPrice: number; sellingPrice: number; photoUrl?: string | null };

export const MotorPrice: React.FC = () => {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Bike[]>([]);
  const [parts, setParts] = useState<{ id: string; name: string; sku: string; costPrice: number; sellingPrice: number; listingStatus: string }[]>([]);
  const [msg, setMsg] = useState("");
  const load = (query = q) => {
    fetchApi<{ motorcycles: Bike[]; products: { id: string; name: string; sku: string; costPrice: number; sellingPrice: number; listingStatus: string }[] }>(`/owner/motorcycles?q=${encodeURIComponent(query)}`).then((d) => { setRows(d.motorcycles); setParts(d.products || []); }).catch((e) => setMsg(e.message));
  };
  useEffect(() => { load(""); }, []);
  return (
    <div className="space-y-4 pb-12">
      <header>
        <p className="text-[11px] font-black uppercase tracking-wider text-red-600">Harga motor & Alat Ganti</p>
        <h1 className="text-2xl font-black text-zinc-950">Cari plat atau casis. Hanya pemilik.</h1>
        <p className="text-sm text-zinc-800 font-bold">Hanya rekod yang foreman sudah sahkan. Simpan harga menjadikan kad itu sedia dijual.</p>
      </header>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); load(); }}>
        <input className="flex-1 border-2 border-zinc-300 text-zinc-950 font-bold rounded-xl px-3 py-2 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200" placeholder="Plat, casis, atau model" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl px-5 text-sm font-bold transition shadow-sm cursor-pointer active:scale-95" type="submit">Cari</button>
      </form>
      {msg && <p className="text-sm font-bold text-red-800 bg-red-100 border border-red-300 p-2.5 rounded-xl">{msg}</p>}
      <ul className="space-y-3">
        {rows.length === 0 && <li className="text-sm text-zinc-950 font-bold bg-zinc-50 border-2 border-zinc-200 p-4 rounded-xl">Tiada motor menunggu harga. Foreman kena sahkan set sudut dahulu.</li>}
        {rows.map((b) => <PriceRow key={b.id} bike={b} onSaved={(text) => { setMsg(text); load(); }} />)}
      </ul>
      <h2 className="font-black text-zinc-950 text-base pt-4">Barang yang foreman sudah sahkan</h2>
      <ul className="space-y-3">
        {parts.length === 0 && <li className="text-sm text-zinc-950 font-bold bg-zinc-50 border-2 border-zinc-200 p-4 rounded-xl">Tiada barang menunggu harga.</li>}
        {parts.map((part) => <PartPrice key={part.id} part={part} onSaved={(text) => { setMsg(text); load(); }} />)}
      </ul>
    </div>
  );
};

const PartPrice: React.FC<{ part: { id: string; name: string; sku: string; costPrice: number; sellingPrice: number }; onSaved: (text: string) => void }> = ({ part, onSaved }) => {
  const [price, setPrice] = useState(String(part.sellingPrice));
  return (
    <li className="bg-white border-2 border-zinc-200 rounded-2xl p-4 flex flex-wrap gap-3 items-end shadow-sm">
      <div className="flex-1 min-w-[200px]">
        <p className="font-black text-zinc-950 text-sm">{part.name}</p>
        <p className="text-xs text-zinc-700 font-semibold mt-0.5">{part.sku} · kos <span className="font-mono font-bold text-zinc-900">{rm(part.costPrice)}</span></p>
      </div>
      <label className="text-xs font-bold text-zinc-800">Harga Jual (RM)
        <input className="mt-1 block border-2 border-zinc-300 text-zinc-950 font-bold rounded-xl px-3 py-2 w-36 font-mono" value={price} onChange={(e) => setPrice(e.target.value)} />
      </label>
      <button type="button" className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-sm cursor-pointer active:scale-95" onClick={async () => {
        const res = await fetchApi<{ belowCost: boolean }>(`/owner/products/${part.id}/price`, { method: "PATCH", body: JSON.stringify({ sellingPrice: Number(price) }) });
        onSaved(res.belowCost ? "Barang dijual di bawah kos." : "Barang ini dijual.");
      }}>Simpan dan jual</button>
    </li>
  );
};

const PriceRow: React.FC<{ bike: Bike; onSaved: (text: string) => void }> = ({ bike, onSaved }) => {
  const [price, setPrice] = useState(String(bike.sellingPrice));
  const [plate, setPlate] = useState(bike.plateNumber || "");
  return (
    <li className="bg-white border-2 border-zinc-200 rounded-2xl p-4 flex flex-wrap gap-3 items-end shadow-sm">
      <div className="min-w-[180px] flex-1">
        <p className="font-black text-zinc-950 text-sm">{bike.brand} {bike.model}</p>
        <p className="text-xs text-zinc-700 font-semibold mt-0.5">{bike.condition === "new" ? "Baharu" : "Terpakai"} · casis <span className="font-mono">{bike.chassisNo}</span></p>
        <p className="text-xs text-zinc-700 font-semibold">Kos invois <span className="font-mono font-bold text-zinc-900">{rm(bike.costPrice)}</span></p>
      </div>
      <label className="text-xs font-bold text-zinc-800">Plat
        <input className="mt-1 block border-2 border-zinc-300 text-zinc-950 font-bold rounded-xl px-3 py-2 uppercase font-mono" value={plate} onChange={(e) => setPlate(e.target.value)} />
      </label>
      <label className="text-xs font-bold text-zinc-800">Harga jual (RM)
        <input className="mt-1 block border-2 border-zinc-300 text-zinc-950 font-bold rounded-xl px-3 py-2 w-36 font-mono" value={price} onChange={(e) => setPrice(e.target.value)} />
      </label>
      <button type="button" className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-sm cursor-pointer active:scale-95" onClick={async () => {
        const res = await fetchApi<{ belowCost: boolean }>(`/owner/motorcycles/${bike.id}/price`, {
          method: "PATCH",
          body: JSON.stringify({ sellingPrice: Number(price), plateNumber: plate }),
        });
        onSaved(res.belowCost ? "Dijual. Harga di bawah kos, masuk Masalah." : "Harga disimpan. Kad motor ini dijual.");
      }}>Simpan dan jual</button>
    </li>
  );
};

type Account = { id: string; name: string; email: string; phone?: string | null; role: string; isActive: boolean; photoUrl?: string | null };

export const AccountAdmin: React.FC = () => {
  const [rows, setRows] = useState<Account[]>([]);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "kerani_1", pin: "", photoUrl: "" });
  const load = () => fetchApi<{ accounts: Account[] }>("/owner/accounts").then((d) => setRows(d.accounts)).catch((e) => setMsg(e.message));
  useEffect(() => { load(); }, []);

  const readPhoto = (file: File, set: (url: string) => void) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, 320 / img.width);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
        set(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5 pb-12">
      <header>
        <p className="text-[11px] font-black uppercase tracking-wider text-red-600">Akaun staf & Terminal PIN</p>
        <h1 className="text-2xl font-black text-zinc-950">Cipta, ubah, nyahaktif. Hanya pemilik.</h1>
        <p className="text-sm text-zinc-700 font-medium">Nyahaktif tidak memadam jualan lama. Akaun pemilik terakhir tidak boleh dipadam.</p>
      </header>
      {msg && <p className="text-sm font-bold text-red-800 bg-red-100 border border-red-300 p-2.5 rounded-xl">{msg}</p>}
      <form className="bg-white border-2 border-zinc-200 rounded-2xl p-5 grid sm:grid-cols-2 gap-3.5 shadow-sm" onSubmit={async (e) => {
        e.preventDefault();
        await fetchApi("/owner/accounts", { method: "POST", body: JSON.stringify(form) });
        setForm({ name: "", email: "", phone: "", role: "kerani_1", pin: "", photoUrl: "" });
        setMsg("Akaun dicipta.");
        load();
      }}>
        <input required className="border-2 border-zinc-300 text-zinc-950 font-bold rounded-xl px-3 py-2" placeholder="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input required type="email" className="border-2 border-zinc-300 text-zinc-950 font-bold rounded-xl px-3 py-2" placeholder="Emel" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="border-2 border-zinc-300 text-zinc-950 font-bold rounded-xl px-3 py-2" placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input required className="border-2 border-zinc-300 text-zinc-950 font-mono font-bold rounded-xl px-3 py-2" placeholder="PIN (4 angka)" value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value })} />
        <select className="border-2 border-zinc-300 text-zinc-950 font-bold rounded-xl px-3 py-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="kerani_1">Kerani kaunter</option>
          <option value="kerani_2">Kerani stor</option>
          <option value="foreman">Foreman</option>
          <option value="affiliate">Jurujual</option>
          <option value="owner">Pemilik</option>
        </select>
        <input type="file" accept="image/*" className="text-xs font-bold text-zinc-800" onChange={(e) => { const f = e.target.files?.[0]; if (f) readPhoto(f, (url) => setForm({ ...form, photoUrl: url })); }} />
        <button className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-2.5 text-sm font-bold sm:col-span-2 transition shadow-sm cursor-pointer active:scale-95" type="submit">Cipta akaun</button>
      </form>
      <ul className="space-y-3">
        {rows.map((a) => <AccountRow key={a.id} account={a} onChange={load} readPhoto={readPhoto} />)}
      </ul>
    </div>
  );
};

const AccountRow: React.FC<{ account: Account; onChange: () => void; readPhoto: (file: File, set: (url: string) => void) => void }> = ({ account, onChange, readPhoto }) => {
  const [name, setName] = useState(account.name);
  const [phone, setPhone] = useState(account.phone || "");
  const [role, setRole] = useState(account.role);
  const [pin, setPin] = useState("");
  const [photoUrl, setPhotoUrl] = useState(account.photoUrl || "");
  return (
    <li className={`bg-white border-2 rounded-2xl p-4 flex flex-wrap gap-3 items-center shadow-sm ${account.isActive ? "border-zinc-200" : "border-zinc-200 opacity-60 bg-zinc-50"}`}>
      {photoUrl ? <img src={photoUrl} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-zinc-300" /> : <div className="w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-zinc-700">HQ</div>}
      <input className="border-2 border-zinc-300 text-zinc-950 font-bold rounded-xl px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="border-2 border-zinc-300 text-zinc-950 font-bold rounded-xl px-3 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <select className="border-2 border-zinc-300 text-zinc-950 font-bold rounded-xl px-3 py-2" value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="kerani_1">Kerani kaunter</option>
        <option value="kerani_2">Kerani stor</option>
        <option value="foreman">Foreman</option>
        <option value="affiliate">Jurujual</option>
        <option value="owner">Pemilik</option>
      </select>
      <input className="border-2 border-zinc-300 text-zinc-950 font-mono font-bold rounded-xl px-3 py-2 w-28" placeholder="PIN baharu" value={pin} onChange={(e) => setPin(e.target.value)} />
      <input type="file" accept="image/*" className="text-xs font-bold text-zinc-700" onChange={(e) => { const f = e.target.files?.[0]; if (f) readPhoto(f, setPhotoUrl); }} />
      <button type="button" className="bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm cursor-pointer active:scale-95" onClick={async () => {
        await fetchApi(`/owner/accounts/${account.id}`, { method: "PATCH", body: JSON.stringify({ name, phone, role, pin: pin || undefined, photoUrl }) });
        onChange();
      }}>Simpan</button>
      {account.isActive && (
        <button type="button" className="text-red-700 hover:text-red-800 text-xs font-bold cursor-pointer hover:underline" onClick={async () => {
          await fetchApi(`/owner/accounts/${account.id}/deactivate`, { method: "POST" });
          onChange();
        }}>Nyahaktif</button>
      )}
    </li>
  );
};

type ArahanItem = { id: string; title: string; detail: string; targetRole: string; status: string; fromName: string; fromPhoto?: string | null };

export const ArahanList: React.FC = () => {
  const [rows, setRows] = useState<ArahanItem[]>([]);
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("kerani_1");
  const load = () => fetchApi<{ arahan: ArahanItem[] }>("/desk/arahan").then((d) => setRows(d.arahan));
  useEffect(() => { load(); }, []);
  return (
    <div className="space-y-4 pb-12">
      <header>
        <p className="text-[11px] font-black uppercase tracking-wider text-red-600">Arahan terbuka</p>
        <h1 className="text-2xl font-black text-zinc-950">Arahan yang belum disentuh staf</h1>
      </header>
      <form className="flex flex-wrap gap-2" onSubmit={async (e) => {
        e.preventDefault();
        await fetchApi("/owner/arahan", { method: "POST", body: JSON.stringify({ title, detail: title, targetRole: role, source: "manual" }) });
        setTitle("");
        load();
      }}>
        <input className="flex-1 border-2 border-zinc-300 text-zinc-950 font-bold rounded-xl px-3 py-2" placeholder="Arahan" value={title} onChange={(e) => setTitle(e.target.value)} />
        <select className="border-2 border-zinc-300 text-zinc-950 font-bold rounded-xl px-3 py-2" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="kerani_1">Kerani kaunter</option>
          <option value="kerani_2">Kerani stor</option>
          <option value="foreman">Foreman</option>
          <option value="affiliate">Jurujual</option>
        </select>
        <button className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-5 text-sm font-bold transition shadow-sm cursor-pointer active:scale-95" type="submit">Hantar</button>
      </form>
      <ul className="space-y-2">
        {rows.filter((r) => r.status === "open").map((r) => (
          <li key={r.id} className="bg-white border-2 border-zinc-200 rounded-xl px-4 py-2.5 text-sm flex justify-between gap-3 shadow-xs">
            <span className="font-bold text-zinc-900">{r.title} · <span className="text-red-700">{roleLabel(r.targetRole)}</span></span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const ArahanStrip: React.FC<{ role: string }> = ({ role }) => {
  const [rows, setRows] = useState<ArahanItem[]>([]);
  const [deposits, setDeposits] = useState<{ id: string; customerName: string; slipRef?: string; model?: string; amount: number }[]>([]);
  const load = () => {
    fetchApi<{ arahan: ArahanItem[] }>("/desk/arahan").then((d) => setRows(d.arahan.filter((r) => r.status === "open"))).catch(() => setRows([]));
    if (role === "owner") {
      fetchApi<{ deposits: { id: string; customerName: string; slipRef?: string; model?: string; amount: number }[] }>("/desk/deposits")
        .then((d) => setDeposits(d.deposits))
        .catch(() => setDeposits([]));
    }
  };
  useEffect(() => { load(); }, [role]);
  if (rows.length === 0 && deposits.length === 0) return null;
  return (
    <section className="bg-white border-2 border-zinc-200 shadow-sm rounded-2xl p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b-2 border-zinc-100">
        <h2 className="text-xs font-black text-zinc-950 tracking-wider uppercase font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          Tugasan & Arahan Langsung Pemilik
        </h2>
        <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 text-[10px] font-mono font-black">
          {rows.length + deposits.length} Tertangguh
        </span>
      </div>
      {rows.map((r) => (
        <div key={r.id} className="flex items-center justify-between gap-3 text-xs bg-zinc-50 p-3 rounded-xl border border-zinc-200">
          <span className="flex items-center gap-2.5">
            {r.fromPhoto ? (
              <img src={r.fromPhoto} alt="" className="w-7 h-7 rounded-full object-cover border border-zinc-300" />
            ) : (
              <span className="w-7 h-7 rounded-full bg-red-100 text-red-800 font-black flex items-center justify-center text-[10px] border border-red-200">
                HQ
              </span>
            )}
            <span className="font-bold text-zinc-950">{r.title}</span>
          </span>
          <button 
            type="button" 
            className="text-xs font-black px-3.5 py-1.5 rounded-lg bg-white border-2 border-zinc-200 text-zinc-900 hover:text-emerald-800 hover:border-emerald-400 hover:bg-emerald-50 transition shadow-2xs cursor-pointer active:scale-95" 
            onClick={async () => { 
              await fetchApi(`/desk/arahan/${r.id}/done`, { method: "POST" }); 
              load(); 
            }}
          >
            Selesai
          </button>
        </div>
      ))}
      {deposits.map((d) => (
        <div key={d.id} className="flex flex-wrap items-center justify-between gap-2 text-xs border-t-2 border-zinc-100 pt-3">
          <span className="text-zinc-800 font-semibold">
            Slip <span className="font-mono font-black text-zinc-950">{d.slipRef}</span> · <span className="font-bold">{d.customerName}</span> · {d.model} · <span className="font-mono font-black text-red-700">{rm(d.amount)}</span>
          </span>
          <span className="flex items-center gap-2">
            <button 
              type="button" 
              className="bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-bold rounded-lg px-3.5 py-1.5 transition shadow-sm cursor-pointer active:scale-95" 
              onClick={async () => { 
                await fetchApi(`/desk/deposits/${d.id}/match`, { method: "POST" }); 
                load(); 
              }}
            >
              Padan
            </button>
            <button 
              type="button" 
              className="text-xs font-bold text-red-700 hover:text-red-800 px-2.5 py-1 rounded-lg hover:bg-red-50 transition cursor-pointer" 
              onClick={async () => { 
                await fetchApi(`/desk/deposits/${d.id}/reject`, { method: "POST" }); 
                load(); 
              }}
            >
              Tolak
            </button>
          </span>
        </div>
      ))}
    </section>
  );
};
