import { useState } from "react";
import axios from "axios";
import "./App.css";

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
console.log(process.env.REACT_APP_HOST_SERVER)
  const handleFileChange = (e:any) => {
    setFile(e.target.files[0]);
  };
  const uploadFileToBackend = async (file: any) => {
    const form = new FormData();

    form.append("elementi", file);

    const csv = await axios.post(
      `http://192.168.2.212:5006/bom/upload?type=csv&lp=true`,
      form
    );
    return new Blob([csv.data],{type:"text/csv"});
  };

  const handleUpload = async () => {
    if (!file) return alert("Seleziona un file prima di continuare.");

    setLoading(true);
    try {
      const csvBlob = await uploadFileToBackend(file);
      const url = window.URL.createObjectURL(csvBlob);
      console.log(url);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "response.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Errore durante l'invio del file.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-xl border shadow-md max-w-md mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-4">Upload e Download CSV</h2>
      <input type="file" onChange={handleFileChange} className="mb-4" />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        disabled={!file || loading}
      >
        {loading ? "Caricamento..." : "Invia e Scarica CSV"}
      </button>
    </div>
  );
}
