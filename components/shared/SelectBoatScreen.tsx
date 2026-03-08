import { useState } from "react";

const BOATS = [
  { id: "1",  name: "Bravo",   reg: "GJ-11-BK-0368" },
  { id: "2",  name: "Alpha",   reg: "GJ-11-BK-0369" },
  { id: "3",  name: "Charlie", reg: "GJ-11-BK-0363" },
  { id: "4",  name: "Delta",   reg: "GJ-11-BK-0368" },
  { id: "5",  name: "Echo",    reg: "GJ-11-BK-0360" },
  { id: "6",  name: "Foxtrot", reg: "GJ-11-BK-0360" },
  { id: "7",  name: "Bravo",   reg: "GJ-11-BK-0248" },
  { id: "8",  name: "Charlie", reg: "GJ-11-BK-0364" },
  { id: "9",  name: "Alpha",   reg: "GJ-11-BK-0369" },
  { id: "10", name: "Echo",    reg: "GJ-11-BK-0385" },
  { id: "11", name: "Bravo",   reg: "GJ-11-BK-0368" },
];

function BoatIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
      <path d="M23 9 L9 35 L23 35 Z" fill="#E8743A" />
      <path d="M25 9 L39 35 L25 35 Z" fill="#F0954E" opacity="0.9" />
      <rect x="22" y="7" width="4" height="28" rx="2" fill="#8B4513" />
      <path d="M7 37 Q24 44 41 37 L39 35 L9 35 Z" fill="#C1440E" />
    </svg>
  );
}

export default function SelectBoatScreen({ onBack, onConfirm, confirmLabel = "Continue" }) {
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? BOATS.filter(b =>
        b.name.toLowerCase().includes(query.toLowerCase()) ||
        b.reg.toLowerCase().includes(query.toLowerCase())
      )
    : BOATS;

  return (
    <div style={{
      width: "100%", minHeight: "100vh",
      background: "#0F1923",
      display: "flex", flexDirection: "column",
      fontFamily: "system-ui, -apple-system, sans-serif",
      color: "#fff",
    }}>

      {/* Header */}
      <div style={{ padding: "48px 20px 0" }}>
        <p style={{
          margin: "0 0 8px", fontSize: 11, fontWeight: 700,
          color: "#4A90E2", letterSpacing: 2, textTransform: "uppercase",
        }}>
          SELECT WHICH BOAT ARRIVED
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button
            onClick={onBack}
            style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: "#1A2535", border: "1px solid #2A3A4E",
              color: "#94A3B8", fontSize: 18, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >←</button>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#FFFFFF" }}>
            Select a Boat
          </h1>
        </div>

        {/* Search */}
        <div style={{
          background: "#1A2535", border: "1px solid #2A3A4E",
          borderRadius: 12, display: "flex", alignItems: "center",
          padding: "0 14px", gap: 10, marginBottom: 14,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.4, flexShrink: 0 }}>
            <circle cx="6.5" cy="6.5" r="5" stroke="#94A3B8" strokeWidth="1.5" />
            <path d="M10.5 10.5L14 14" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search your Boat name here"
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "#CBD5E1", fontSize: 14, padding: "13px 0",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          />
          {query.length > 0 && (
            <button onClick={() => setQuery("")} style={{
              background: "none", border: "none", color: "#64748B",
              fontSize: 18, cursor: "pointer", padding: 0, lineHeight: 1,
            }}>×</button>
          )}
        </div>

        <p style={{ margin: "0 0 16px", fontSize: 13, color: "#4A6080" }}>
          {filtered.length} boats registered
        </p>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, padding: "0 20px", overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#4A6080" }}>
            No boats found for "{query}"
          </div>
        ) : (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10, paddingBottom: 16,
          }}>
            {filtered.map(boat => {
              const isSelected = selected?.id === boat.id;
              return (
                <button
                  key={boat.id}
                  onClick={() => setSelected(boat)}
                  style={{
                    background: isSelected ? "#162944" : "#1A2535",
                    border: `1.5px solid ${isSelected ? "#4A90E2" : "#2A3A4E"}`,
                    borderRadius: 14, padding: "16px 8px 12px",
                    cursor: "pointer", display: "flex",
                    flexDirection: "column", alignItems: "center", gap: 7,
                    position: "relative", transition: "border-color 0.15s",
                  }}
                >
                  {isSelected && (
                    <div style={{
                      position: "absolute", top: 7, right: 7,
                      width: 17, height: 17, borderRadius: "50%",
                      background: "#4A90E2",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                        <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                  <BoatIcon />
                  <span style={{ fontWeight: 700, fontSize: 13, color: "#FFFFFF" }}>{boat.name}</span>
                  <span style={{ fontSize: 10, color: "#4A6080" }}>{boat.reg}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm button */}
      <div style={{ padding: "12px 20px 36px", background: "#0F1923" }}>
        <button
          onClick={() => selected && onConfirm?.(selected)}
          disabled={!selected}
          style={{
            width: "100%", padding: "15px", borderRadius: 14, border: "none",
            background: selected ? "#2563EB" : "#1A2535",
            color: selected ? "#FFFFFF" : "#4A6080",
            fontSize: 16, fontWeight: 700, cursor: selected ? "pointer" : "default",
            fontFamily: "system-ui, -apple-system, sans-serif",
            transition: "background 0.2s, color 0.2s",
          }}
        >
          {selected ? confirmLabel : "Select a boat to continue"}
        </button>
      </div>
    </div>
  );
}

// TODO: Replace hardcoded BOATS array with API call:
// const { data: boats } = useQuery(['registered-boats', companyId], () =>
//   api.get(`/companies/${companyId}/registered-boats`)
// )
// Then pass as prop: <SelectBoatScreen boats={boats} ... />