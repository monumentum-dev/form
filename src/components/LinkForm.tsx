import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

interface FormDataState {
  name: string;
  phone: string;
  link: string;
}

const LinkForm: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormDataState>({
    name: "",
    phone: "",
    link: "",
  });
  const [otp, setOtp] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");

const host = "https://law-f4xw.onrender.com";


  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+48\s?[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "phone") {
      setPhoneError(validatePhone(value) ? "" : "Niepoprawny format numeru telefonu");
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOtpChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = otp.split("");
    newOtp[index] = value;
    setOtp(newOtp.join(""));
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

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
        setStep(2);
      } else {
        setMessage(`❌ Błąd: ${result.error}`);
      }
    } catch {
      setMessage("❌ Błąd serwera. Spróbuj ponownie później.");
    }
    setLoading(false);
  };

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
        setStep(3);
      } else {
        setMessage(`❌ Błąd: ${result.error}`);
      }
    } catch {
      setMessage("❌ Błąd serwera. Spróbuj ponownie później.");
    }
    setLoading(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`${host}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (response.ok) {
        setMessage("✅ Link został pomyślnie dodany!");
        setStep(1);
        setFormData({ name: "", phone: "", link: "" });
        setOtp("");
      } else {
        setMessage(`❌ Błąd: ${result.error}`);
      }
    } catch {
      setMessage("❌ Błąd serwera. Spróbuj ponownie później.");
    }
    setLoading(false);
  };

  return (
    <div className="my-5">
      <div className="row fs-4">
        <div className="mx-auto col-lg-6 py-3 px-4 border">
          {message && <div className="alert alert-info">{message}</div>}
          {step === 1 && (
            <form>
            <label className="form-label mb-2">Numer telefonu komórkowego</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+48 123456789" required className="form-control mb-2" />
              {phoneError && <div className="text-danger">{phoneError}</div>}
              <button onClick={sendPhone} className="btn btn-primary mt-2" disabled={loading}>{loading ? "Wysyłanie..." : "Wyślij numer"}</button>
            </form>
          )}
          {step === 2 && (
            <div>
              <label className="form-label">Kod weryfikacyjny z SMS</label>
              <div className="d-flex gap-2"> 
              {[0, 1, 2, 3].map((index) => (
                <input  className="form-control otp-input text-center" key={index} id={`otp-${index}`} type="text" maxLength={1}  value={otp[index] || ""} onChange={(e) => handleOtpChange(e, index)} />
              ))}
              </div>
              <button onClick={validateOtp} className="btn btn-primary mt-2" disabled={loading}>{loading ? "Sprawdzanie..." : "Sprawdź kod"}</button>
            </div>
          )}
          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Imię i nazwisko" required className="form-control mb-2" />
              <input type="text" name="link" value={formData.link} onChange={handleChange} placeholder="Wprowadź link" required className="form-control mb-2" />
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Wysyłanie..." : "Dodaj link"}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkForm;
