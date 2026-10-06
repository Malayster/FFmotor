export const getBikeImage = (model: string = ""): string => {
  const m = model.toLowerCase();
  if (m.includes("nvx") || m.includes("aerox")) {
    return "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80";
  }
  if (m.includes("y15") || m.includes("sniper") || m.includes("exciter") || m.includes("y16")) {
    return "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80";
  }
  if (m.includes("rs-x") || m.includes("rsx") || m.includes("winner") || m.includes("rs150")) {
    return "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=600&q=80";
  }
  if (m.includes("adv") || m.includes("vario") || m.includes("beat")) {
    return "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&w=600&q=80";
  }
  if (m.includes("xmax") || m.includes("forza") || m.includes("tmax")) {
    return "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80";
  }
  if (m.includes("mt-15") || m.includes("mt15") || m.includes("mt-25") || m.includes("naked")) {
    return "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80";
  }
  return "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80";
};

export const getPartImage = (item: { name?: string; category?: string; brand?: string; sku?: string }): string => {
  const text = `${item.name || ""} ${item.category || ""} ${item.brand || ""} ${item.sku || ""}`.toLowerCase();
  
  if (text.includes("motul") || text.includes("7100") || text.includes("300v")) {
    return "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80";
  }
  if (text.includes("yamalube") || text.includes("minyak") || text.includes("oil") || text.includes("pelincir") || text.includes("4t")) {
    return "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80";
  }
  if (text.includes("tayar") || text.includes("tyre") || text.includes("tire") || text.includes("maxxis") || text.includes("corsa")) {
    return "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=400&q=80";
  }
  if (text.includes("plug") || text.includes("spark") || text.includes("ngk") || text.includes("batu api") || text.includes("iridium")) {
    return "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=400&q=80";
  }
  if (text.includes("belt") || text.includes("sawat") || text.includes("cvt") || text.includes("b65")) {
    return "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80";
  }
  if (text.includes("brembo") || text.includes("brake") || text.includes("pad") || text.includes("brek") || text.includes("caliper") || text.includes("disc")) {
    return "https://images.unsplash.com/photo-1600790142055-619df03207e6?auto=format&fit=crop&w=400&q=80";
  }
  if (text.includes("rantai") || text.includes("chain") || text.includes("sprocket") || text.includes("did") || text.includes("spoket")) {
    return "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=400&q=80";
  }
  if (text.includes("helmet") || text.includes("gracshaw") || text.includes("kyt") || text.includes("shoei") || text.includes("arai")) {
    return "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80";
  }
  if (text.includes("bateri") || text.includes("battery") || text.includes("kozi") || text.includes("yuasa")) {
    return "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=400&q=80";
  }
  return "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80";
};

