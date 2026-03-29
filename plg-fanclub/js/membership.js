(() => {
  const form = document.getElementById("membershipForm");
  const successBox = document.getElementById("membershipSuccess");
  if (!form) return;

  const getField = (id) => document.getElementById(id);
  const phonePattern = /^\+?[0-9\s\-()]{8,}$/;

  const setError = (id, message) => {
    const field = getField(id);
    const errorNode = form.querySelector(`.field-error[data-for="${id}"]`);
    if (errorNode) {
      errorNode.textContent = message;
    }
    if (field) {
      field.setAttribute("aria-invalid", message ? "true" : "false");
    }
  };

  const validateField = (id) => {
    const field = getField(id);
    if (!field) return true;
    const value = field.value.trim();

    switch (id) {
      case "fullName":
        if (value.length < 3) {
          setError(id, "Please enter your full name.");
          return false;
        }
        break;
      case "dob": {
        if (!value) {
          setError(id, "Please select your date of birth.");
          return false;
        }
        const selectedDate = new Date(value);
        const today = new Date();
        if (selectedDate > today) {
          setError(id, "Date of birth cannot be in the future.");
          return false;
        }
        break;
      }
      case "gender":
        if (!value) {
          setError(id, "Please choose your gender.");
          return false;
        }
        break;
      case "phone":
      case "emergencyPhone":
        if (!value) {
          setError(id, "Please provide a phone number.");
          return false;
        }
        if (!phonePattern.test(value)) {
          setError(id, "Please enter a valid phone number.");
          return false;
        }
        break;
      case "whatsapp":
        if (value && !phonePattern.test(value)) {
          setError(id, "Please enter a valid WhatsApp number.");
          return false;
        }
        break;
      case "email":
        if (value && !field.checkValidity()) {
          setError(id, "Please enter a valid email address.");
          return false;
        }
        break;
      case "address":
        if (value.length < 8) {
          setError(id, "Please provide your residential address.");
          return false;
        }
        break;
      case "occupation":
      case "emergencyName":
        if (value.length < 2) {
          setError(id, "This field is required.");
          return false;
        }
        break;
      case "hearAbout":
        if (!value) {
          setError(id, "Please tell us how you heard about PLG Fan Club.");
          return false;
        }
        break;
      case "photo": {
        const file = field.files && field.files[0];
        if (!file) {
          setError(id, "Please upload your profile photo.");
          return false;
        }
        if (!file.type.startsWith("image/")) {
          setError(id, "Uploaded file must be an image.");
          return false;
        }
        break;
      }
      case "declaration":
        if (!field.checked) {
          setError(id, "You must agree before submitting your application.");
          return false;
        }
        break;
      default:
        break;
    }

    setError(id, "");
    return true;
  };

  const fieldsToValidate = [
    "fullName",
    "dob",
    "gender",
    "phone",
    "whatsapp",
    "email",
    "address",
    "occupation",
    "emergencyName",
    "emergencyPhone",
    "hearAbout",
    "photo",
    "declaration",
  ];

  fieldsToValidate.forEach((id) => {
    const field = getField(id);
    if (!field) return;

    const eventType = id === "photo" || id === "gender" || id === "hearAbout" || id === "declaration" ? "change" : "input";
    field.addEventListener(eventType, () => {
      validateField(id);
    });

    field.addEventListener("blur", () => {
      validateField(id);
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (successBox) {
      successBox.hidden = true;
      successBox.classList.remove("is-error");
      successBox.textContent = "";
    }

    let allValid = true;
    fieldsToValidate.forEach((id) => {
      const isValid = validateField(id);
      if (!isValid) allValid = false;
    });

    if (!allValid) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) {
        firstInvalid.focus();
      }
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const originalLabel = submitButton ? submitButton.textContent : "";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";
    }

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: new FormData(form),
      });

      if (!response.ok) {
        throw new Error("Unable to submit membership form.");
      }

      form.reset();
      fieldsToValidate.forEach((id) => setError(id, ""));

      if (successBox) {
        successBox.textContent = "Success. Your membership application has been sent to the PLG Fan Club email inbox.";
        successBox.hidden = false;
        successBox.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } catch (error) {
      if (successBox) {
        successBox.textContent = "We could not send your application right now. Please check your internet and try again.";
        successBox.classList.add("is-error");
        successBox.hidden = false;
        successBox.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalLabel;
      }
    }
  });
})();
