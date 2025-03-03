import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

interface FormDataState {
  name: string;
  phone: string;
  files: File[];
}

const ClientForm: React.FC = () => {
  const [step, setStep] = useState<number>(1); // Zarządzanie krokami
  const [formData, setFormData] = useState<FormDataState>({
    name: "",
    phone: "",
    files: [],
  });
  const [otp, setOtp] = useState<string>(""); // Kod OTP
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");

  const host = 'https://law-f4xw.onrender.com';



  // 📌 Weryfikacja formatu telefona

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+48\s?[0-9]{9}$/; // Obsługuje numery z prefiksem lub bez
    return phoneRegex.test(phone);
  };

  // 📌 Change focus automaticly
  const handleOtpChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (!/^[0-9]?$/.test(value)) return; // Only allow single digit

    const newOtp = otp.split("");
    newOtp[index] = value;
    setOtp(newOtp.join(""));

    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus(); // Move to next input
    } else if (!value && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus(); // Move to previous input on delete
    }
  };



  // 📌 Zmiana pól wejściowych
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "phone") {
      setPhoneError(validatePhone(value) ? "" : "Niepoprawny format numeru telefonu");
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 📌 Obsługa przesyłania plików
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFormData((prev) => {
        const newFiles = [...prev.files];
        newFiles[index] = files[0];
        return { ...prev, files: newFiles };
      });
    }
  };
  // 📌 Usunięcie plików
  const handleFileRemove = (index: number) => {
    setFormData((prev) => {
      const newFiles = prev.files.filter((_, i) => i !== index);
      return { ...prev, files: newFiles };
    });
  };

  // 📌 Wysyłanie numeru telefonu (KROK 1)
  const sendPhone = async () => {
    const cleanedPhone = formData.phone.replace(/\s+/g, "").trim();

    if (!validatePhone(cleanedPhone)) {
      setPhoneError("Podaj poprawny numer telefonu!");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${host}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanedPhone }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("✅ Kod weryfikacyjny wysłany!");
        setStep(2); // Przejście do kroku 2
      } else {
        setMessage(`❌ Błąd: ${result.error}`);
      }
    } catch (error) {
      setMessage("❌ Błąd serwera. Spróbuj ponownie później.");
    }

    setLoading(false);
  };


  // 📌 Weryfikacja OTP (KROK 2)
  const validateOtp = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${host}/validation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone, otp }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("✅ Kod weryfikacyjny potwierdzony!");
        setStep(3); // Przejście do kroku 3
      } else {
        setMessage(`❌ Błąd: ${result.error}`);
      }
    } catch (error) {
      setMessage("❌ Błąd serwera. Spróbuj ponownie później.");
    }

    setLoading(false);
  };

  // 📌 Ostateczne przesłanie danych (KROK 3)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (formData.files.length === 0) {
      setMessage("❌ Musisz dodać co najmniej jeden plik!");
      return;
    }
    setLoading(true);
    setMessage("");

    const data = new FormData();
    data.append("name", formData.name);
    data.append("phone", formData.phone);
    formData.files.forEach((file) => data.append("files", file));

    try {
      const response = await fetch(`${host}/clients`, {
        method: "POST",
        body: data,
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("✅ Pliki zostały pomyślnie dodany!");
        setStep(1); // Reset do pierwszego kroku
        setFormData({ name: "", phone: "", files: [] });
        setOtp("");
      } else {
        setMessage(`❌ Błąd: ${result.error}`);
      }
    } catch (error) {
      setMessage("❌ Błąd serwera. Spróbuj ponownie później.");
    }

    setLoading(false);
  };

  return (
    <div className="my-5">
      {step === 1 && <p className="mb-4 text-bold text-center"><strong className="fs-4 text-warning">Prosimy przygotować telefon komórkowy 📱 do przyjęcia kodu weryfikacyjnego przez SMS </strong></p>}

      <div className="row fs-4">
        <div className="mx-auto col-lg-6">


          {message && <div className="alert alert-info">{message}</div>}

          {step === 1 && (
            <form className="form-inline">
              <label className="form-label">Numer telefonu komórkowego</label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+48 123456789"
                required
              />

              {phoneError && <div className="text-danger">{phoneError}</div>}
              <button onClick={sendPhone} className="btn btn-primary mt-2" disabled={loading}>
                {loading ? "Wysyłanie..." : "Wyślij numer"}
              </button>
            </form>
          )}

          {step === 2 && (
            <div>
              <label className="form-label">Kod weryfikacyjny z SMS</label>
              <div className="d-flex gap-2">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    className="form-control otp-input text-center"
                    value={otp[index] || ""}
                    onChange={(e) => handleOtpChange(e, index)}
                  />
                ))}
              </div>
              <button onClick={validateOtp} className="btn btn-primary mt-2" disabled={loading}>
                {loading ? "Sprawdzanie..." : "Sprawdź kod"}
              </button>
            </div>
          )}
          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Imię i nazwisko</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Pliki</label>
                {Array.from({ length: Math.min(formData.files.length + 1, 10) }).map((_, index) => (
                  <div key={index} className="d-flex align-items-center gap-2 mb-2">
                    <input
                      type="file"
                      className="form-control "
                      onChange={(e) => handleFileChange(e, index)}
                      disabled={formData.files.length >= 10}
                    />
                    {index < formData.files.length && (
                      <button type="button" className="btn btn-danger" onClick={() => handleFileRemove(index)}>Usuń</button>
                    )}
                  </div>
                ))}
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Wysyłanie..." : "Dodaj klienta"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientForm;
