import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

interface FormDataState {
  name: string; 
  phone: string;
  files: File[];
}

const ClientForm: React.FC = () => {
  const [step, setStep] = useState<number>(1); // Управление шагами
  const [formData, setFormData] = useState<FormDataState>({
    name: "", 
    phone: "",
    files: [],
  });
  const [otp, setOtp] = useState<string>(""); // OTP-код
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  // 📌 Изменение полей ввода
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 📌 Обработчик загрузки файлов
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, files: Array.from(files) }));
    }
  };

  // 📌 Отправка номера телефона (ШАГ 1)
  const sendPhone = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("https://law-f4xw.onrender.com/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("✅ OTP отправлен!");
        setStep(2); // Переход на шаг 2
      } else {
        setMessage(`❌ Ошибка: ${result.error}`);
      }
    } catch (error) {
      setMessage("❌ Ошибка сервера. Попробуйте позже.");
    }

    setLoading(false);
  };

  // 📌 Отправка OTP на валидацию (ШАГ 2)
  const validateOtp = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("https://law-f4xw.onrender.com/validation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone, otp }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("✅ OTP подтвержден!");
        setStep(3); // Переход на шаг 3
      } else {
        setMessage(`❌ Ошибка: ${result.error}`);
      }
    } catch (error) {
      setMessage("❌ Ошибка сервера. Попробуйте позже.");
    }

    setLoading(false);
  };

  // 📌 Финальная отправка данных (ШАГ 3)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const data = new FormData();
    data.append("name", formData.name);  
    data.append("phone", formData.phone);
    formData.files.forEach((file) => data.append("files", file));

    try {
      const response = await fetch("https://law-f4xw.onrender.com/clients", {
        method: "POST",
        body: data,
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("✅ Клиент успешно добавлен!");
        setStep(1); // Сброс на первый шаг
        setFormData({ name: "",  phone: "", files: [] });
        setOtp("");
      } else {
        setMessage(`❌ Ошибка: ${result.error}`);
      }
    } catch (error) {
      setMessage("❌ Ошибка сервера. Попробуйте позже.");
    }

    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Добавить клиента</h2>

      {message && <div className="alert alert-info">{message}</div>}

      {step === 1 && (
        <div>
          <label className="form-label">Телефон</label>
          <input
            type="tel"
            name="phone"
            className="form-control"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <button onClick={sendPhone} className="btn btn-primary mt-2" disabled={loading}>
            {loading ? "Отправка..." : "Отправить OTP"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <label className="form-label">Введите OTP</label>
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
            {loading ? "Проверка..." : "Проверить OTP"}
          </button>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Имя и фамилия</label>
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
            <label className="form-label">Файлы</label>
            <input type="file" className="form-control" multiple onChange={handleFileChange} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Отправка..." : "Добавить клиента"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ClientForm;
