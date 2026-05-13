import { SectionCard } from "../SectionCard";

export function VisitorFormSection({ form, errors = {}, busy, onChange, onFileChange, onSubmit }) {
  return (
    <SectionCard
      title="Register Visitor"
      subtitle="Pre-register a visitor with contact details, purpose, and photo."
    >
      <form className="stack" onSubmit={onSubmit}>
        <div className="grid two">
          <label>
            Full Name
            <input value={form.fullName} onChange={(e) => onChange("fullName", e.target.value)} required />
            {errors.fullName ? <span className="field-error">{errors.fullName}</span> : null}
          </label>
          <label>
            Company
            <input value={form.company} onChange={(e) => onChange("company", e.target.value)} required />
            {errors.company ? <span className="field-error">{errors.company}</span> : null}
          </label>
        </div>
        <div className="grid two">
          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => onChange("email", e.target.value)} required />
            {errors.email ? <span className="field-error">{errors.email}</span> : null}
          </label>
          <label>
            Phone
            <input value={form.phone} onChange={(e) => onChange("phone", e.target.value)} required />
            {errors.phone ? <span className="field-error">{errors.phone}</span> : null}
          </label>
        </div>
        <label>
          Purpose
          <input value={form.purpose} onChange={(e) => onChange("purpose", e.target.value)} required />
          {errors.purpose ? <span className="field-error">{errors.purpose}</span> : null}
        </label>
        <label>
          Visitor Photo
          <input type="file" accept="image/*" onChange={(e) => onFileChange(e.target.files?.[0] || null)} />
          {form.photoFile ? <span className="form-hint">{form.photoFile.name}</span> : null}
          {errors.photoFile ? <span className="field-error">{errors.photoFile}</span> : null}
        </label>
        <label>
          Photo URL (optional)
          <input value={form.photoUrl} onChange={(e) => onChange("photoUrl", e.target.value)} />
        </label>
        <button className="primary-button" type="submit" disabled={busy}>
          {busy ? "Saving..." : "Save Visitor"}
        </button>
      </form>
    </SectionCard>
  );
}
