export const emptyAppointmentForm = {
  visitorId: "",
  hostId: "",
  visitDate: "",
  purpose: "",
  notes: ""
};

export const emptyVisitorForm = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  purpose: "",
  photoUrl: "",
  photoFile: null
};

export const emptyFilters = {
  q: "",
  company: "",
  status: "",
  hostId: "",
  dateFrom: "",
  dateTo: ""
};

export const buildQueryString = (filters) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  return params.toString();
};

export const validateVisitorForm = (form) => {
  const errors = {};
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const phoneOk = /^\+?[0-9]{10,15}$/.test(form.phone.replace(/\s/g, ""));

  if (!form.fullName.trim()) errors.fullName = "Full name is required.";
  if (!form.company.trim()) errors.company = "Company is required.";
  if (!emailOk) errors.email = "Enter a valid email address.";
  if (!phoneOk) errors.phone = "Enter a valid phone number.";
  if (!form.purpose.trim()) errors.purpose = "Purpose is required.";

  if (form.photoFile) {
    if (!form.photoFile.type.startsWith("image/")) errors.photoFile = "Upload an image file.";
    if (form.photoFile.size > 2 * 1024 * 1024) errors.photoFile = "Photo must be under 2 MB.";
  }

  return errors;
};

export const validateAppointmentForm = (form) => {
  const errors = {};
  const selectedDate = form.visitDate ? new Date(form.visitDate) : null;

  if (!form.visitorId) errors.visitorId = "Choose a visitor.";
  if (!form.hostId) errors.hostId = "Choose a host.";
  if (!form.visitDate) errors.visitDate = "Choose a visit date and time.";
  if (selectedDate && Number.isNaN(selectedDate.getTime())) errors.visitDate = "Choose a valid date.";
  if (!form.purpose.trim()) errors.purpose = "Purpose is required.";

  return errors;
};
