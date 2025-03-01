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

  const host = 'https://law-f4xw.onrender.com';

  // 📌 Zmiana pól wejściowych
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 📌 Obsługa przesyłania plików
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, files: Array.from(files) }));
    }
  };

  // 📌 Wysyłanie numeru telefonu (KROK 1)
  const sendPhone = async () => {
    setLoading(true);
    setMessage("");
   
    try {
      const response = await fetch(`${host}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("✅ OTP wysłany!");
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
        setMessage("✅ OTP potwierdzony!");
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
        setMessage("✅ Klient został pomyślnie dodany!");
        setStep(1); // Reset do pierwszego kroku
        setFormData({ name: "",  phone: "", files: [] });
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
    <div className="container mt-4">
      <h2 className="mb-2">Dołączenie plików</h2>
      <p className="mb-3">Prosimy przygotować telefon komórkowy do przyjęcia kodu weryfikacyjnego przez SMS</p>

      {message && <div className="alert alert-info">{message}</div>}

      {step === 1 && (
        <div>
          <label className="form-label">Numer telefonu komórkowego</label>
          <input
            type="tel"
            name="phone"
            className="form-control"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <button onClick={sendPhone} className="btn btn-primary mt-2" disabled={loading}>
            {loading ? "Wysyłanie..." : "Wyślij numer"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <label className="form-label">Kod weryfikacyjny z SMS</label>
          <div className="d-flex gap-2">
            {[0, 1, 2, 3].map((index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                className="form-control otp-input"
                value={otp[index] || ""}
                onChange={(e) => {
                  const newOtp = otp.split("");
                  newOtp[index] = e.target.value;
                  setOtp(newOtp.join(""));
                }}
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
            <input type="file" className="form-control" multiple onChange={handleFileChange} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Wysyłanie..." : "Dodaj klienta"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ClientForm;
