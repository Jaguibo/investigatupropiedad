const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector("[data-menu]");
const leadForm = document.querySelector("#leadForm");

function closeMobileMenu() {
  if (!navToggle || !navMenu) return;

  navToggle.classList.remove("active");
  navToggle.setAttribute("aria-expanded", "false");
  navMenu.classList.remove("open");
  document.body.classList.remove("menu-open");
}

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");

    navToggle.classList.toggle("active", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });
}

function setError(field, message) {
  const group = field.closest(".form-group");
  if (!group) return;

  const error = group.querySelector(".error-message");
  group.classList.add("invalid");

  if (error) error.textContent = message;
}

function clearError(field) {
  const group = field.closest(".form-group");
  if (!group) return;

  const error = group.querySelector(".error-message");
  group.classList.remove("invalid");

  if (error) error.textContent = "";
}

function validateField(field) {
  const value = field.value.trim();

  if (!value) {
    setError(field, "Este campo es obligatorio.");
    return false;
  }

  if (field.id === "phone" && value.replace(/\D/g, "").length < 8) {
    setError(field, "Ingresa un teléfono o WhatsApp válido.");
    return false;
  }

  clearError(field);
  return true;
}

if (leadForm) {
  const fields = Array.from(
    leadForm.querySelectorAll(
      "input[required], select[required], textarea[required]",
    ),
  );

  fields.forEach((field) => {
    field.addEventListener("input", () => validateField(field));
    field.addEventListener("blur", () => validateField(field));
  });

  leadForm.addEventListener("submit", (event) => {
    const isValid = fields.every(validateField);

    if (!isValid) {
      event.preventDefault();
      return;
    }

    const submitButton = leadForm.querySelector('button[type="submit"]');

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Enviando...";
    }
  });
}
