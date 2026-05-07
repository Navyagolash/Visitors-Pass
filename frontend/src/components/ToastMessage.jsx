export function ToastMessage({ toast, onClose }) {
  if (!toast?.text) {
    return null;
  }

  return (
    <div className={`toast-message toast-${toast.type || "success"}`} role="status" aria-live="polite">
      <div>
        <strong>{toast.title || (toast.type === "error" ? "Something went wrong" : "Success")}</strong>
        <p>{toast.text}</p>
      </div>
      <button className="toast-close" onClick={onClose} aria-label="Close notification">
        x
      </button>
    </div>
  );
}
