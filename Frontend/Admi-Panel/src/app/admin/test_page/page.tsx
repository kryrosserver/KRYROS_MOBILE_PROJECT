"use client";
import { useState } from "react";

export default function TestPage() {
  const TEXT = "#111827";
  const CARD = "#FFFFFF";
  const [showModal, setShowModal] = useState(false);
  
  const items = [1,2,3];
  
  return (
    <div style={{ background: "#F5F6FA" }}>
      <div style={{ display: "flex" }}>
        <div>content</div>
      </div>
      
      <div style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                {["A","B","C"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {true ? (
                <tr><td>loading</td></tr>
              ) : items.map((item, idx) => {
                return (
                  <tr key={idx}>
                    <td>{item}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex" }}>
          {[1,2,3].map((n, i) => (
            <button key={i}>{n}</button>
          ))}
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div style={{ position: "fixed" }}>
          <div style={{ background: CARD }}>
            <div>modal content</div>
          </div>
        </div>
      )}
    </div>
  );
}
