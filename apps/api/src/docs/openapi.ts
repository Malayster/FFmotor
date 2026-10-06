export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "FFmotor 3S Enterprise Edge API",
    version: "2.0.0",
    description:
      "Dokumentasi API Masa Nyata Bengkel 3S Cawangan Mergong. Dikuasakan oleh Cloudflare Workers, Hono RPC, D1 SQLite, dan Zod Schema Validation.",
    contact: {
      name: "Pasukan Kejuruteraan FFmotor",
      email: "tech@ffmotor.my",
    },
  },
  servers: [
    {
      url: "http://localhost:8787",
      description: "Pembangunan Tempatan (Local Dev)",
    },
    {
      url: "https://api.ffmotor.my",
      description: "Pengeluaran (Cloudflare Edge)",
    },
  ],
  paths: {
    "/api/health": {
      get: {
        summary: "Semakan Kesihatan Sistem (Health Check)",
        tags: ["Sistem"],
        responses: {
          200: {
            description: "Pelayan Edge beroperasi secara normal.",
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Log Masuk Staf (Email & Password)",
        tags: ["Autentikasi"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", example: "admin@ffmotor.my" },
                  password: { type: "string", example: "admin123" },
                },
                required: ["email", "password"],
              },
            },
          },
        },
        responses: {
          200: { description: "Log masuk berjaya dengan token sesi." },
          401: { description: "Kredensial tidak sah." },
        },
      },
    },
    "/api/auth/zero-trust/verify": {
      post: {
        summary: "Pengesahan Zero-Trust Terminal PIN Staf",
        tags: ["Autentikasi"],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  pin: { type: "string", example: "8899" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Sesi staf terminal berjaya disahkan." },
          401: { description: "PIN tidak sah." },
        },
      },
    },
    "/api/work-orders": {
      get: {
        summary: "Senarai Kad Kerja & Lif Bengkel (Work Orders)",
        tags: ["Bengkel & Pit Lif"],
        parameters: [
          {
            name: "status",
            in: "query",
            schema: { type: "string" },
            description: "Tapis status kad kerja (cth: in_progress, ready, completed)",
          },
        ],
        responses: {
          200: { description: "Senarai kad kerja berjaya diperoleh." },
        },
      },
      post: {
        summary: "Buka Kad Kerja Baru (Work Order Intake)",
        tags: ["Bengkel & Pit Lif"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  vehicleId: { type: "string", example: "veh_123" },
                  mechanicId: { type: "string", example: "usr_foreman" },
                  mileageIn: { type: "number", example: 12500 },
                  customerComplaint: { type: "string", example: "Bunyi bising enjin dan brek bergegar" },
                },
                required: ["vehicleId", "customerComplaint"],
              },
            },
          },
        },
        responses: {
          201: { description: "Kad kerja baru berjaya dibuka." },
        },
      },
    },
    "/api/products": {
      get: {
        summary: "Katalog Alat Ganti & Carian Inventori",
        tags: ["Stor & Inventori"],
        parameters: [
          { name: "q", in: "query", schema: { type: "string" }, description: "Carian SKU atau nama alat" },
          { name: "category", in: "query", schema: { type: "string" }, description: "Tapis mengikut kategori" },
        ],
        responses: {
          200: { description: "Senarai produk inventori." },
        },
      },
    },
    "/api/finance/closing/current": {
      get: {
        summary: "Ringkasan Laci Tunai & Lejar Hari Ini",
        tags: ["Kewangan & Lejar"],
        responses: {
          200: { description: "Kiraan lejar tunai kaunter." },
        },
      },
    },
    "/api/loan-pipeline/calculate": {
      post: {
        summary: "Kalkulator Ansuran Kredit Motosikal (Aeon/Chailease)",
        tags: ["Jualan & Showroom"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  loanAmount: { type: "number", example: 8500 },
                  termMonths: { type: "number", example: 36 },
                  interestRate: { type: "number", example: 8.5 },
                },
                required: ["loanAmount", "termMonths"],
              },
            },
          },
        },
        responses: {
          200: { description: "Jadual ansuran dan faedah berjaya dikira." },
        },
      },
    },
    "/api/owner/board": {
      get: {
        summary: "Papan Kawalan Eksekutif Pemilik (Executive Cockpit)",
        tags: ["Pengurusan Pemilik"],
        responses: {
          200: { description: "Data metrik wang, margin, masalah, dan aktiviti kedai." },
          403: { description: "Hanya pemilik dibenarkan." },
        },
      },
    },
  },
};

