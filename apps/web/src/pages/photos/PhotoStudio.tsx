import React, { useEffect, useState } from "react";
import { fetchApi } from "../../lib/api";

const SLOT_LABEL: Record<string, string> = {
  depan: "Depan",
  belakang: "Belakang",
  atas: "Atas",
  bawah: "Bawah",
  tepi_kiri: "Tepi kiri",
  tepi_kanan: "Tepi kanan",
  enjin: "Enjin / butiran",
  warna: "Warna unit ini",
  odometer: "Odometer",
  keadaan: "Kehausan",
  calar: "Calar",
  dokumen: "Resit / dokumen",
  kerosakan: "Kerosakan semasa masuk",
};

type Subject = {
  id: string;
  subjectType: "motorcycle" | "product" | "document" | "service";
  title: string;
  subtitle: string;
  condition?: string | null;
  color?: string | null;
  year?: number;
  engineNo?: string;
  chassisNo?: string;
  plateNumber?: string | null;
  costPrice?: number;
  currentMileage?: number | null;
  brand?: string;
  model?: string;
  category?: string;
  stockQty?: number;
  rackLocation?: string;
  listingStatus: string;
  listingNote?: string | null;
  need: number;
  have: number;
};

type Shot = { id: string; slot: string; label?: string | null; image: string };

function compress(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("fail"));
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, 900 / img.width);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export const PhotoStudio: React.FC<{ role: "kerani_1" | "kerani_2" | "foreman" }> = ({ role }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [current, setCurrent] = useState<Subject | null>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [reason, setReason] = useState("");
  const [scratch, setScratch] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const loadSubjects = () => {
    fetchApi<{ subjects: Subject[] }>("/desk/shots/subjects").then((d) => setSubjects(d.subjects)).catch((e) => setMsg(e.message));
  };
  useEffect(() => { loadSubjects(); }, [role]);

  const open = async (subject: Subject) => {
    setCurrent(subject);
    const data = await fetchApi<{ shots: Shot[]; slots: string[]; listingStatus: string; listingNote?: string | null }>(`/desk/shots/${subject.subjectType}/${subject.id}`);
    setShots(data.shots);
    setSlots(data.slots);
    setStatus(data.listingStatus);
    setNote(data.listingNote || null);
  };

  const removeShot = async (shotId: string) => {
    if (!current) return;
    await fetchApi(`/desk/shots/shot/${shotId}`, { method: "DELETE" });
    setMsg("Gambar dibuang.");
    await open(current);
    loadSubjects();
  };

  const upload = async (slot: string, file: File, label?: string, shotId?: string) => {
    if (!current) return;
    const image = await compress(file);
    await fetchApi("/desk/shots", { method: "POST", body: JSON.stringify({ subjectType: current.subjectType, subjectId: current.id, slot, image, label, shotId }) });
    setMsg(slot === "calar" ? "Gambar calar disimpan." : `${SLOT_LABEL[slot]} disimpan.`);
    await open(current);
    loadSubjects();
  };

  const title = role === "foreman" ? "Gambar servis masuk" : "Gambar motor, barang, dan resit";

  return (
    <div className="space-y-4 pb-12">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-wider text-red-600">{title}</p>
        <h1 className="text-2xl font-black text-zinc-950">Setiap sudut pada rekod yang sama</h1>
        <p className="text-sm text-zinc-500">
          {role === "foreman"
            ? "Foreman hanya ambil gambar bila motor masuk bengkel untuk servis atau selenggara. Bukan gambar jualan."
            : "Kedua-dua kerani ambil gambar motor, alat ganti, resit, dan dokumen lain. Foreman tidak ambil gambar ini."}
        </p>
      </header>
      {msg && <p className="text-sm text-zinc-700">{msg}</p>}
      <div className="grid lg:grid-cols-[280px_1fr] gap-4">
        <div className="space-y-2">
          {role !== "foreman" && (
            <button type="button" className="w-full bg-red-600 text-white rounded-2xl px-3 py-2 text-sm font-bold" onClick={() => { setAdding(true); setEditing(false); setForm({ jenis: "motor", condition: "new", kind: "resit" }); }}>
              Tambah motor, barang, atau resit
            </button>
          )}
          {adding && (
            <UnitForm
              role={role}
              form={form}
              setForm={setForm}
              onClose={() => setAdding(false)}
              onSaved={async (text) => { setMsg(text); setAdding(false); loadSubjects(); }}
            />
          )}
          {subjects.length === 0 && <p className="text-sm text-zinc-500">Tiada rekod untuk peranan ini.</p>}
          {subjects.map((subject) => (
            <div key={subject.subjectType + subject.id} className={`bg-white border rounded-2xl p-3 ${current?.id === subject.id ? "border-zinc-950" : "border-zinc-200"}`}>
              <button type="button" className="w-full text-left" onClick={() => open(subject)}>
                <p className="font-black text-sm">{subject.title}</p>
                <p className="text-xs text-zinc-500">{subject.subtitle} · {subject.have}/{subject.need} · {subject.listingStatus}</p>
              </button>
              {role !== "foreman" && (
                <div className="flex gap-2 mt-2">
                  <button type="button" className="text-[11px] font-bold bg-zinc-950 text-white rounded-lg px-2 py-1" onClick={() => { setCurrent(subject); setEditing(true); setForm({
                    brand: subject.brand || "",
                    model: subject.model || "",
                    color: subject.color || "",
                    condition: subject.condition || "new",
                    year: String(subject.year || ""),
                    engineNo: subject.engineNo || "",
                    chassisNo: subject.chassisNo || "",
                    plateNumber: subject.plateNumber || "",
                    costPrice: String(subject.costPrice || ""),
                    currentMileage: String(subject.currentMileage || ""),
                    name: subject.title,
                    sku: subject.subtitle,
                    category: subject.category || "",
                    stockQty: String(subject.stockQty || ""),
                    rackLocation: subject.rackLocation || "",
                    partBrand: subject.brand || "",
                  }); }}>Edit</button>
                  <button type="button" className="text-[11px] font-bold text-red-700" onClick={async () => {
                    if (!window.confirm("Buang rekod ini dan semua gambarnya?")) return;
                    const path = subject.subjectType === "motorcycle" ? `/desk/shots/motorcycles/${subject.id}` : subject.subjectType === "product" ? `/desk/shots/products/${subject.id}` : `/desk/shots/documents/${subject.id}`;
                    await fetchApi(path, { method: "DELETE" });
                    if (current?.id === subject.id) setCurrent(null);
                    setMsg("Rekod dibuang.");
                    loadSubjects();
                  }}>Buang</button>
                </div>
              )}
              {editing && current?.id === subject.id && (
                <UnitForm role={role} form={form} setForm={setForm} subject={subject} onClose={() => setEditing(false)} onSaved={async (text) => { setMsg(text); setEditing(false); loadSubjects(); }} />
              )}
            </div>
          ))}
        </div>
        {current && (
          <section className="bg-white border border-zinc-200 rounded-3xl p-4 space-y-4">
            <div>
              <h2 className="font-black">{current.title}</h2>
              <p className="text-xs text-zinc-500">Status: {status}</p>
              {current.subjectType === "motorcycle" && (
                <p className="text-sm text-zinc-700 mt-1">
                  {current.condition === "used"
                    ? `Set terpakai untuk warna ${current.color}. Wajib odometer dan gambar kehausan. Setiap calar pada unit ini satu gambar.`
                    : `Set baharu untuk warna ${current.color}. Tiada odometer dan tiada calar. Gambar warna mesti cat unit ini, bukan brosur.`}
                </p>
              )}
              {note && <p className="text-sm text-red-700 mt-1">Foreman: {note}</p>}
              {role !== "foreman" && current.subjectType !== "document" && current.subjectType !== "service" && (
                <YoutubeField subjectType={current.subjectType} subjectId={current.id} onSaved={setMsg} />
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {slots.map((slot) => {
                const shot = shots.find((item) => item.slot === slot);
                return (
                  <div key={slot} className="border border-zinc-200 rounded-2xl overflow-hidden bg-zinc-50">
                    <div className="aspect-square bg-zinc-100 flex items-center justify-center">
                      {shot ? <img src={shot.image} alt={SLOT_LABEL[slot]} className="w-full h-full object-cover" /> : <span className="text-xs text-zinc-400">Kosong</span>}
                    </div>
                    <div className="p-2 space-y-1">
                      <p className="text-xs font-bold">{SLOT_LABEL[slot]}</p>
                      {(role !== "foreman" || current.subjectType === "service") ? (
                        <div className="flex gap-1">
                          {!shot && (
                            <>
                              <label className="bg-red-600 text-white text-[11px] font-bold rounded-lg px-2 py-1 cursor-pointer flex items-center gap-1 text-center leading-tight">
                                Kamera
                                <input className="hidden" type="file" accept="image/*" capture="environment" onChange={(e) => { const file = e.target.files?.[0]; if (file) upload(slot, file); }} />
                              </label>
                              <label className="bg-zinc-100 text-zinc-800 border border-zinc-300 text-[11px] font-bold rounded-lg px-2 py-1 cursor-pointer flex items-center gap-1 text-center leading-tight">
                                Galeri
                                <input className="hidden" type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) upload(slot, file); }} />
                              </label>
                            </>
                          )}
                          {shot && (
                            <>
                              <label className="bg-zinc-950 text-white text-[11px] font-bold rounded-lg px-2 py-1 cursor-pointer flex items-center gap-1 text-center leading-tight">
                                Edit (Kamera)
                                <input className="hidden" type="file" accept="image/*" capture="environment" onChange={(e) => { const file = e.target.files?.[0]; if (file) upload(slot, file); }} />
                              </label>
                            </>
                          )}
                          {shot && <button type="button" className="text-[11px] font-bold text-red-700 px-2 py-1" onClick={() => removeShot(shot.id)}>Buang</button>}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
            {current.subjectType === "motorcycle" && current.condition === "used" && (
              <div className="space-y-2">
                <p className="text-xs font-bold">Calar atau kemek. Satu gambar satu kerosakan.</p>
                <div className="flex flex-wrap gap-2">
                  {shots.filter((shot) => shot.slot === "calar").map((shot) => (
                    <div key={shot.id} className="w-24">
                      <img src={shot.image} alt={shot.label || "Calar"} className="w-24 h-24 object-cover rounded-xl border border-zinc-200" />
                      <p className="text-[10px] font-bold truncate">{shot.label}</p>
                      {role === "kerani_1" && (
                        <div className="flex gap-1">
                          <label className="text-[11px] font-bold bg-zinc-950 text-white rounded px-1.5 py-0.5 cursor-pointer">
                            Edit
                            <input className="hidden" type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) upload("calar", file, shot.label || "Calar", shot.id); }} />
                          </label>
                          <button type="button" className="text-[11px] font-bold text-red-700" onClick={() => removeShot(shot.id)}>Buang</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {role === "kerani_1" && (
                  <label className="text-xs font-bold block">
                    Nama calar
                    <input className="mt-1 border border-zinc-300 rounded-xl px-3 py-2 block" value={scratch} onChange={(e) => setScratch(e.target.value)} />
                    <span className="mt-2 inline-block bg-red-600 text-white rounded-lg px-3 py-1.5 cursor-pointer">
                      Tambah calar
                      <input className="hidden" type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) upload("calar", file, scratch || "Calar"); }} />
                    </span>
                  </label>
                )}
              </div>
            )}
            {role !== "foreman" && current.subjectType !== "service" && (
              <button type="button" className="bg-zinc-950 text-white rounded-xl px-4 py-2 text-sm font-bold" onClick={async () => {
                await fetchApi("/desk/shots/submit", { method: "POST", body: JSON.stringify({ subjectType: current.subjectType, subjectId: current.id }) });
                setMsg(current.subjectType === "document" ? "Dokumen disimpan." : "Dihantar kepada pemilik untuk letak harga. Foreman tidak menyemak gambar jualan.");
                await open(current);
                loadSubjects();
              }}>{current.subjectType === "document" ? "Simpan dokumen" : "Hantar untuk harga"}</button>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

const YoutubeField: React.FC<{ subjectType: string; subjectId: string; onSaved: (text: string) => void }> = ({ subjectType, subjectId, onSaved }) => {
  const [url, setUrl] = useState("");
  return (
    <form className="flex gap-2" onSubmit={async (event) => {
      event.preventDefault();
      try {
        await fetchApi("/desk/shots/video", { method: "POST", body: JSON.stringify({ subjectType, subjectId, videoUrl: url }) });
        onSaved(url ? "Pautan YouTube disimpan." : "Video dibuang.");
      } catch (error) {
        onSaved(error instanceof Error ? error.message : "Video ditolak");
      }
    }}>
      <input className="flex-1 border border-zinc-300 rounded-xl px-3 py-2 text-sm" placeholder="Pautan YouTube sahaja" value={url} onChange={(e) => setUrl(e.target.value)} />
      <button className="bg-zinc-950 text-white rounded-xl px-3 text-xs font-bold" type="submit">Simpan video</button>
    </form>
  );
};

const field = "border border-zinc-300 rounded-xl px-3 py-2 text-sm w-full";

const UnitForm: React.FC<{
  role: "kerani_1" | "kerani_2" | "foreman";
  form: Record<string, string>;
  setForm: (next: Record<string, string>) => void;
  subject?: Subject;
  onClose: () => void;
  onSaved: (text: string) => void;
}> = ({ role, form, setForm, subject, onClose, onSaved }) => {
  const set = (key: string, value: string) => setForm({ ...form, [key]: value });
  return (
    <form className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3 space-y-2" onSubmit={async (e) => {
      e.preventDefault();
      const jenis = subject?.subjectType === "product" ? "barang" : subject?.subjectType === "document" ? "dokumen" : subject ? "motor" : (form.jenis || "motor");
      if (jenis === "motor") {
        const path = subject ? `/desk/shots/motorcycles/${subject.id}` : "/desk/shots/motorcycles";
        await fetchApi(path, { method: subject ? "PATCH" : "POST", body: JSON.stringify(form) });
        onSaved(subject ? "Butiran motor dikemas kini." : "Motor ditambah. Isi set gambar warna ini.");
      } else if (jenis === "barang") {
        const path = subject ? `/desk/shots/products/${subject.id}` : "/desk/shots/products";
        await fetchApi(path, { method: subject ? "PATCH" : "POST", body: JSON.stringify({ ...form, brand: form.partBrand || form.brand }) });
        onSaved(subject ? "Butiran barang dikemas kini." : "Barang ditambah. Isi set gambarnya.");
      } else {
        await fetchApi("/desk/shots/documents", { method: "POST", body: JSON.stringify(form) });
        onSaved("Rekod resit atau dokumen ditambah. Masukkan gambarnya.");
      }
      onClose();
    }}>
      {!subject && (
        <select className={field} value={form.jenis || "motor"} onChange={(e) => set("jenis", e.target.value)}>
          <option value="motor">Motor</option>
          <option value="barang">Alat ganti</option>
          <option value="dokumen">Resit atau dokumen lain</option>
        </select>
      )}
      {(subject ? subject.subjectType === "motorcycle" : (form.jenis || "motor") === "motor") ? (
        <>
          <input className={field} required placeholder="Jenama" value={form.brand || ""} onChange={(e) => set("brand", e.target.value)} />
          <input className={field} required placeholder="Model" value={form.model || ""} onChange={(e) => set("model", e.target.value)} />
          <input className={field} required placeholder="Warna unit ini" value={form.color || ""} onChange={(e) => set("color", e.target.value)} />
          <select className={field} value={form.condition || "new"} onChange={(e) => set("condition", e.target.value)}>
            <option value="new">Baharu</option>
            <option value="used">Terpakai</option>
          </select>
          <input className={field} placeholder="Tahun" value={form.year || ""} onChange={(e) => set("year", e.target.value)} />
          <input className={field} required placeholder="No. enjin" value={form.engineNo || ""} onChange={(e) => set("engineNo", e.target.value)} />
          <input className={field} required placeholder="No. casis" value={form.chassisNo || ""} onChange={(e) => set("chassisNo", e.target.value)} />
          <input className={field} placeholder="No. plat, kalau ada" value={form.plateNumber || ""} onChange={(e) => set("plateNumber", e.target.value)} />
          <input className={field} placeholder="Kos invois" value={form.costPrice || ""} onChange={(e) => set("costPrice", e.target.value)} />
        </>
      ) : (subject ? subject.subjectType === "product" : form.jenis === "barang") ? (
        <>
          <input className={field} required placeholder="Nama barang" value={form.name || ""} onChange={(e) => set("name", e.target.value)} />
          <input className={field} required placeholder="SKU" value={form.sku || ""} onChange={(e) => set("sku", e.target.value)} disabled={Boolean(subject)} />
          <input className={field} required placeholder="Jenama" value={form.partBrand || ""} onChange={(e) => set("partBrand", e.target.value)} />
          <input className={field} placeholder="Kategori" value={form.category || ""} onChange={(e) => set("category", e.target.value)} />
          <input className={field} placeholder="Stok" value={form.stockQty || ""} onChange={(e) => set("stockQty", e.target.value)} />
          <input className={field} placeholder="Kos" value={form.costPrice || ""} onChange={(e) => set("costPrice", e.target.value)} />
        </>
      ) : (
        <>
          <input className={field} required placeholder="Tajuk resit atau dokumen" value={form.title || ""} onChange={(e) => set("title", e.target.value)} />
          <select className={field} value={form.kind || "resit"} onChange={(e) => set("kind", e.target.value)}>
            <option value="resit">Resit</option>
            <option value="lain">Lain-lain</option>
          </select>
        </>
      )}
      <div className="flex gap-2">
        <button className="bg-zinc-950 text-white rounded-lg px-3 py-1.5 text-xs font-bold" type="submit">{subject ? "Simpan" : "Tambah"}</button>
        <button className="text-xs font-bold text-zinc-600" type="button" onClick={onClose}>Batal</button>
      </div>
    </form>
  );
};
