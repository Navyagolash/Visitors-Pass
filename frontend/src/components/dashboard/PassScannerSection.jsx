import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { SectionCard } from "../SectionCard";

export function PassScannerSection({
  passCode,
  error,
  verifiedPass,
  busyAction,
  onPassCodeChange,
  onVerify,
  onScanAction,
  onExportLogs
}) {
  const [showScanner, setShowScanner] = useState(false);

  return (
    <SectionCard title="Pass Scanner" subtitle="Verify a pass code and process entry or exit.">
      <div className="stack">
        <label>
          Pass Code
          <input value={passCode} onChange={(e) => onPassCodeChange(e.target.value.toUpperCase())} />
          {error ? <span className="field-error">{error}</span> : null}
        </label>

        <div className="inline-actions">
          <button className="primary-button" disabled={busyAction === "verify-pass"} onClick={onVerify}>
            {busyAction === "verify-pass" ? "Verifying..." : "Verify Pass"}
          </button>
          <button className="ghost-button" type="button" onClick={() => setShowScanner((current) => !current)}>
            {showScanner ? "Hide Scanner" : "Open QR Scanner"}
          </button>
          <button className="ghost-button" disabled={busyAction === "check_in"} onClick={() => onScanAction("check_in")}>
            {busyAction === "check_in" ? "Checking In..." : "Check In"}
          </button>
          <button className="ghost-button" disabled={busyAction === "check_out"} onClick={() => onScanAction("check_out")}>
            {busyAction === "check_out" ? "Checking Out..." : "Check Out"}
          </button>
          <button className="ghost-button link-button" disabled={busyAction === "export-logs"} onClick={onExportLogs}>
            {busyAction === "export-logs" ? "Exporting..." : "Export Logs"}
          </button>
        </div>

        {showScanner ? (
          <div className="scanner-wrap">
            <Scanner
              constraints={{ facingMode: "environment" }}
              onScan={(results) => {
                const firstResult = results?.[0]?.rawValue;
                if (firstResult) {
                  try {
                    const parsed = JSON.parse(firstResult);
                    onPassCodeChange(parsed.passCode || firstResult);
                  } catch {
                    onPassCodeChange(firstResult);
                  }
                  setShowScanner(false);
                }
              }}
              onError={() => {}}
            />
          </div>
        ) : null}

        {verifiedPass ? (
          <div className="pass-preview">
            <div>
              <h4>{verifiedPass.visitorId?.fullName}</h4>
              <p className="muted">Host: {verifiedPass.hostId?.name}</p>
              <p className="muted">Status: {verifiedPass.status}</p>
              <p className="muted">Code: {verifiedPass.passCode}</p>
            </div>
            {verifiedPass.qrImage ? <img src={verifiedPass.qrImage} alt="QR pass" /> : null}
          </div>
        ) : null}
      </div>
    </SectionCard>
  );
}
