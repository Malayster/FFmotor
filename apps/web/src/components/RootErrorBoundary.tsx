import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class RootErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Ralat dikesan dalam Aplikasi FFmotor:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", backgroundColor: "#020617", color: "#f8fafc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "sans-serif" }}>
          <div style={{ maxWidth: "650px", width: "100%", backgroundColor: "#0f172a", border: "1px solid #dc2626", borderRadius: "20px", padding: "28px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.7)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "#ef444420", border: "1px solid #ef444440", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                ⚠️
              </div>
              <div>
                <h2 style={{ color: "#f87171", fontSize: "17px", fontWeight: "bold", margin: 0 }}>Ralat Paparan Dikesan</h2>
                <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>Sistem menghentikan render untuk melindungi data operasi bengkel</p>
              </div>
            </div>

            <div style={{ backgroundColor: "#020617", color: "#fca5a5", padding: "14px", borderRadius: "12px", fontSize: "12px", fontFamily: "monospace", overflowX: "auto", marginBottom: "20px", border: "1px solid #334155" }}>
              {this.state.error?.message || "Ralat tidak diketahui semasa memuatkan komponen."}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.removeItem("ffmotor_current_user");
                    localStorage.clear();
                  } catch (e) {}
                  window.location.reload();
                }}
                style={{ backgroundColor: "#f59e0b", color: "#020617", padding: "10px 20px", borderRadius: "10px", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "13px" }}
              >
                🔄 Kosongkan Sesi & Muat Semula
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{ backgroundColor: "#1e293b", color: "#f8fafc", padding: "10px 20px", borderRadius: "10px", fontWeight: "600", border: "1px solid #475569", cursor: "pointer", fontSize: "13px" }}
              >
                Cuba Semula
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

