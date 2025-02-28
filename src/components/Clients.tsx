import { useState, useEffect } from "react";

interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  files: { _key: string; asset: { url: string } }[];
}


const ClientList = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch(`http://localhost:3000/clients`);
        if (!response.ok) throw new Error("Ошибка загрузки данных");
        const data = await response.json();
        setClients(data);
      } catch (err) {
        setError("Не удалось загрузить клиентов");
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Список клиентов</h2>
      {loading && <p>Загрузка...</p>}
      {error && <p className="text-danger">{error}</p>}

      <div className="table-responsive">
        <table className="table table-bordered">
          <thead className="table-dark">
            <tr>
              <th>Имя</th>
              <th>Email</th>
              <th>Телефон</th>
              <th>Файлы</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client._id}>
                <td>{client.name}</td>
                <td>{client.email}</td>
                <td>{client.phone}</td>
                <td>
                  {client.files.length > 0 ? (
                    client.files.map((file) => (
                      <a
                        key={file._key}
                        href={file.asset.url}
                        download
                        className="btn btn-primary btn-sm me-2"
                      >
                        Скачать
                      </a>
                    ))
                  ) : (
                    <span className="text-muted">Нет файлов</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientList;
