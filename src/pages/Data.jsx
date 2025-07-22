import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import Navbar from "../components/Navbar";
import { API_BASE } from "../config/api";

async function fetchProducts({ source, startDate, endDate, filename }) {
  const params = new URLSearchParams({
    source,
    startdt: startDate || "",
    enddt: endDate || "",
    filename: filename || "",
  });
  const res = await fetch(`${API_BASE}/api/products?${params.toString()}`);
  const json = await res.json();
  return json.data;
}

function Data() {
  const [source, setSource] = useState("product");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filename, setFilename] = useState(null);
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [filenames,setFilenames] = useState([]);
  useEffect(() => {
    loadData();
    fetchFilenames();
  }, []);

  async function loadData() {
    const data = await fetchProducts({
      source,
      startDate: startDate ? startDate.toISOString().slice(0, 10) : "",
      endDate: endDate ? endDate.toISOString().slice(0, 10) : "",
      filename: filename ? filename.value : "",
    });
    setProducts(data);
  }

  function onSearch() {
    loadData();
  }

  function onDelete(id) {
    Swal.fire({
      title: "Yakin ingin menghapus produk ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await fetch(`${API_BASE}/api/products/${id}?source=${source}`, { method: "DELETE" });
        Swal.fire("Berhasil dihapus!", "", "success");
        loadData();
      }
    });
  }

  async function fetchFilenames() {
  try {
    const res = await fetch(`${API_BASE}/api/filenames`);
    const json = await res.json();
    const options = json.data.map(name => ({ value: name, label: name }));
    setFilenames(options);
  } catch (error) {
    console.error("Gagal mengambil filename:", error);
  }
}
  function openModal(product) {
    setModalContent(product);
    setModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-white">
      <Navbar />
    <div className="container mx-auto p-20">
      <div className="flex gap-2 items-center mb-4">
        <button
          className="border-2 border-indigo-600 text-indigo-600 bg-white py-1 px-4 rounded hover:bg-indigo-600 hover:text-white"
          onClick={() => window.history.back()}
          title="Back"
        >
          ← Back
        </button>

        <button
          className="border-2 border-indigo-600 text-indigo-600 bg-white py-1 px-4 rounded hover:bg-indigo-600 hover:text-white"
          onClick={() => {
            if (
              window.confirm("Apakah anda yakin akan mendownload semua data?")
            ) {
              window.location.href = `${API_BASE}/downloadall?source=${source}`;
            }
          }}
        >
          Download All
        </button>

        <Select
          options={[
            { value: "product", label: "Product" },
            { value: "blur", label: "Blur" },
          ]}
          value={{ value: source, label: source }}
          onChange={(option) => setSource(option.value)}
          className="w-1/4"
        />
      </div>

      {/* Filter */}
      <div className="flex gap-4 mb-4 items-center">
        <div>
          <label>Start Date</label>
          <Flatpickr
            value={startDate}
            onChange={([date]) => setStartDate(date)}
            options={{ dateFormat: "Y-m-d", allowInput: false }}
            className="border p-1 rounded"
          />
        </div>
        <div>
          <label>End Date</label>
          <Flatpickr
            value={endDate}
            onChange={([date]) => setEndDate(date)}
            options={{ dateFormat: "Y-m-d", allowInput: false }}
            className="border p-1 rounded"
          />
        </div>

        {/* Filename select example, replace with API options */}
        <div className="w-1/4">
          <label>Data By</label>
          <Select
  options={filenames}
  value={filename}
  onChange={setFilename}
  isClearable
  placeholder="Pilih filename..."
/>
        </div>

        <button
          className="bg-blue-600 text-white px-4 py-1 rounded"
          onClick={onSearch}
        >
          Search
        </button>
      </div>

      {/* Table */}
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">No</th>
            <th className="border px-2 py-1">Product Id</th>
            <th className="border px-2 py-1">Description</th>
            <th className="border px-2 py-1">Quantity</th>
            <th className="border px-2 py-1">Unit Price</th>
            <th className="border px-2 py-1">Discount %</th>
            <th className="border px-2 py-1">Line Total</th>
            <th className="border px-2 py-1">Created</th>
            <th className="border px-2 py-1">User</th>
            <th className="border px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center py-4">
                Tidak ada data yang tersedia
              </td>
            </tr>
          ) : (
            products.map((prod, i) => (
              <tr key={prod.id}>
                <td className="border px-2 py-1">{i + 1}</td>
                <td className="border px-2 py-1">{prod.product_number}</td>
                <td className="border px-2 py-1">{prod.description}</td>
                <td className="border px-2 py-1">{prod.quantity}</td>
                <td className="border px-2 py-1">{parseFloat(prod.unit_price).toFixed(2)}</td>
                <td className="border px-2 py-1">{prod.discount ? prod.discount + "%" : ""}</td>
                <td className="border px-2 py-1">{parseFloat(prod.line_total).toFixed(2)}</td>
                <td className="border px-2 py-1">{prod.createddate}</td>
                <td className="border px-2 py-1">{prod.usernm}</td>
                <td className="border px-2 py-1">
                  <button
                    onClick={() => onDelete(prod.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => openModal(prod)}
                    className="ml-2 bg-green-600 text-white px-2 py-1 rounded"
                  >
                    Detail
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded shadow max-w-lg w-full relative">
            <h2 className="text-xl font-bold mb-4">
              Detail Produk - {modalContent?.product_number}
            </h2>
            <pre className="whitespace-pre-wrap">{modalContent?.description}</pre>
            <button
              onClick={() => setModalOpen(false)}
              className="mt-4 bg-gray-300 px-4 py-1 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

export default Data;
