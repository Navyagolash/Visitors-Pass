import { SectionCard } from "../SectionCard";

const downloadBadgePdf = (pass) => {
  if (!pass.badgePdfBase64) {
    return;
  }

  const byteCharacters = atob(pass.badgePdfBase64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let index = 0; index < byteCharacters.length; index += 1) {
    byteNumbers[index] = byteCharacters.charCodeAt(index);
  }

  const pdfBlob = new Blob([new Uint8Array(byteNumbers)], { type: "application/pdf" });
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const link = document.createElement("a");
  link.href = pdfUrl;
  link.download = `${pass.passCode}.pdf`;
  link.click();
  URL.revokeObjectURL(pdfUrl);
};

export function IssuedPassesSection({ passes, onSelectPass }) {
  return (
    <SectionCard title="Issued Passes" subtitle="Digital badges generated for visitors.">
      <div className="pass-grid">
        {passes.length === 0 ? <p className="muted">No passes found for the selected filters.</p> : null}
        {passes.map((pass) => (
          <article className="pass-card" key={pass._id}>
            <div onClick={() => onSelectPass(pass.passCode)} role="button" tabIndex={0}>
              <p className="eyebrow">{pass.passCode}</p>
              <h4>{pass.visitorId?.fullName}</h4>
              <p className="muted">{pass.appointmentId?.purpose}</p>
              <span className={`status-pill ${pass.status}`}>{pass.status}</span>
            </div>
            {pass.qrImage ? <img src={pass.qrImage} alt={pass.passCode} /> : <div className="qr-fallback">QR</div>}
            <button className="ghost-button" type="button" onClick={() => downloadBadgePdf(pass)}>
              Download Badge PDF
            </button>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
