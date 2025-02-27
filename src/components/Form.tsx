import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

interface FormDataState {
  name: string;
  email: string;
  phone: string;
  files: File[];
}

const ClientForm: React.FC = () => {
  const [formData, setFormData] = useState<FormDataState>({
    name: "",
    email: "",
    phone: "",
    files: [],
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  // Обработчик изменения текстовых полей
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Обработчик загрузки файлов
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, files: Array.from(files) }));
    }
  };

  // Отправка формы
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
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
        setFormData({ name: "", email: "", phone: "", files: [] });
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
          <label className="form-label">E-mail</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Телефон</label>
          <input
            type="tel"
            name="phone"
            className="form-control"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Файлы</label>
          <input
            type="file"
            className="form-control"
            multiple
            onChange={handleFileChange}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Отправка..." : "Добавить клиента"}
        </button>
      </form>
    </div>
  );
};

export default ClientForm;
