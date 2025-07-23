import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import Select from "react-select";
import { saveAs } from "file-saver";
import Flatpickr from "react-flatpickr";
import Navbar from "../components/Navbar";
import { Helmet } from "react-helmet";
import "flatpickr/dist/themes/material_green.css";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import gsap from "gsap";
import DataTable from "react-data-table-component";
import { API_BASE } from "../config/api";

function Data() {
  const [source, setSource] = useState("product");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filename, setFilename] = useState(null);
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [filenames, setFilenames] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const iconRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [data, setData] = useState([]);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setIsExportOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    loadData();
    fetchFilenames();
  }, []);

  useEffect(() => {
    if (isOpen) {
      gsap.to(containerRef.current, {
        width: "100%",
        opacity: 1,
        duration: 0.6,
        ease: "power3.out",
        paddingLeft: "12px",
        pointerEvents: "auto",
      });

      gsap.to(iconRef.current, {
        rotation: 360,
        duration: 0.6,
        ease: "power3.inOut",
        onComplete: () => gsap.set(iconRef.current, { rotation: 0 }),
      });
    } else {
      gsap.to(containerRef.current, {
        width: 0,
        opacity: 0,
        duration: 0.6,
        ease: "power3.inOut",
        paddingLeft: 0,
      });

      gsap.to(iconRef.current, {
        rotation: -360,
        duration: 0.6,
        ease: "power3.inOut",
        onComplete: () => gsap.set(iconRef.current, { rotation: 0 }),
      });
    }
  }, [isOpen]);

  async function fetchProducts({
    source,
    startDate,
    endDate,
    filename,
    page,
    limit,
  }) {
    const draw = page;
    const start = (page - 1) * limit;
    const length = limit;

    const params = new URLSearchParams({
      source,
      startdt: startDate || "",
      enddt: endDate || "",
      filename: filename || "",
      draw,
      start,
      length,
    });

    const res = await fetch(`${API_BASE}/api/products?${params.toString()}`, {
      credentials: "include",
    });

    const json = await res.json();

    return {
      data: json.data || [],
      total: json.recordsFiltered || 0,
    };
  }

  const handlePageChange = (page) => {
    loadData(page, rowsPerPage);
  };
  const handlePerRowsChange = async (newPerPage, page) => {
    setRowsPerPage(newPerPage);
    loadData(page, newPerPage);
  };
useEffect(() => {
  if (!isOpen) {
    setStartDate(null);
    setEndDate(null);
    setFilename(null);

    // load data setelah filter ditutup
    loadData();
  }
}, [isOpen]);

const handleToggleFilter = () => {
  setIsOpen(!isOpen);
};

  async function loadData(page = currentPage, limit = rowsPerPage) {
    const result = await fetchProducts({
      source,
      startDate: startDate ? startDate.toISOString().slice(0, 10) : "",
      endDate: endDate ? endDate.toISOString().slice(0, 10) : "",
      filename: filename || "",
      page,
      limit,
    });

    setProducts(result.data);
    setTotalRows(result.total);
    setCurrentPage(page);
  }

  function onSearch() {
    loadData();
  }

  async function onDelete(id) {
    const confirm = await Swal.fire({
      title: "Yakin ingin menghapus produk ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(
          `${API_BASE}/api/products/${id}?source=${source}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Gagal menghapus data");
        }

        Swal.fire("Berhasil dihapus!", "", "success");
        loadData();
      } catch (err) {
        Swal.fire("Gagal!", err.message, "error");
        console.error("Delete error:", err);
      }
    }
  }

  async function fetchFilenames() {
    try {
      const res = await fetch(`${API_BASE}/api/filenames`);
      const json = await res.json();
      const options = json.data.map((name) => ({ value: name, label: name }));
      setFilenames(options);
    } catch (error) {
      console.error("Gagal mengambil filename:", error);
    }
  }
  const columns = [
    { name: "No", selector: (_, index) => index + 1, width: "60px" },
    { name: "Product Id", selector: (row) => row.product_number },
    {
      name: "Description",
      selector: (row) => row.description,
      wrap: true,
      grow: 2,
      style: {
        whiteSpace: "pre-wrap",
        overflowWrap: "break-word",
      },
    },
    { name: "Quantity", selector: (row) => row.quantity },
    {
      name: "Unit Price",
      selector: (row) => parseFloat(row.unit_price).toFixed(2),
    },
    {
      name: "Discount %",
      selector: (row) => (row.discount ? row.discount + "%" : ""),
    },
    {
      name: "Line Total",
      selector: (row) => parseFloat(row.line_total).toFixed(2),
    },
    { name: "Created", selector: (row) => row.createddate },
    { name: "User", selector: (row) => row.usernm },
    {
      name: "Action",
      selector: (row) => (
        <button className="btn btn-danger" onClick={() => onDelete(row.id)}>
          <i className="fa fa-trash"></i>
        </button>
      ),
    },
  ];

  const exportData = (type) => {
    const dataToExport = data.map((row, index) => ({
      No: index + 1,
      ProductId: row.product_number,
      Description: row.description,
      Quantity: row.quantity,
      UnitPrice: row.unit_price,
      Discount: row.discount,
      LineTotal: row.line_total,
      Created: row.createddate,
      User: row.usernm,
    }));

    let content = "";
    let filenameExport = "export";

    if (type === "csv") {
      const header = Object.keys(dataToExport[0] || {}).join(";");
      const rows = dataToExport.map((row) => Object.values(row).join(";"));
      content = [header, ...rows].join("\n");
      filenameExport += ".csv";
    } else if (type === "json") {
      content = JSON.stringify(dataToExport, null, 2);
      filenameExport += ".json";
    } else if (type === "txt") {
      content = dataToExport
        .map((row) => Object.values(row).join(" | "))
        .join("\n");
      filenameExport += ".txt";
    } else if (type === "sql") {
      const values = dataToExport
        .map(
          (row) =>
            `('${row.ProductId}', '${row.Description}', ${row.Quantity}, ${row.UnitPrice}, ${row.Discount}, ${row.LineTotal}, '${row.Created}', '${row.User}')`
        )
        .join(",\n");
      content = `INSERT INTO products (product_number, description, quantity, unit_price, discount, line_total, createddate, usernm)\nVALUES\n${values};`;
      filenameExport += ".sql";
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, filenameExport);
  };

  useEffect(() => {
    if (isOpen) {
      containerRef.current.style.transition = "all 0.3s ease";
      containerRef.current.style.width = "auto";
      containerRef.current.style.opacity = 1;
      containerRef.current.style.paddingLeft = "1rem";
    } else {
      containerRef.current.style.width = 0;
      containerRef.current.style.opacity = 0;
      containerRef.current.style.paddingLeft = 0;
    }
  }, [isOpen]);

  useEffect(() => {
    onSearch();
  }, [source]);

  return (
    <>
      <Helmet>
        <title>Ocr Convert - Data</title>
      </Helmet>
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
                  window.confirm(
                    "Apakah anda yakin akan mendownload semua data?"
                  )
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
            />
            <Select
              options={filenames}
              value={filename}
              onChange={setFilename}
              isClearable
              placeholder="Pilih filename..."
            />
          </div>

          {/* Filter Slide Section */}
          <div className="flex items-center gap-2">
            <div
              className="flex items-center cursor-pointer select-none"
              onClick={handleToggleFilter}
            >
              <span className="mr-1 font-semibold">show</span>
              <span ref={iconRef} className="text-blue-600">
                {isOpen ? <FaArrowLeft /> : <FaArrowRight />}
              </span>
            </div>

            <div
              ref={containerRef}
              className="overflow-hidden flex items-center gap-4"
              style={{
                width: 0,
                opacity: 0,
                paddingLeft: 0,
                whiteSpace: "nowrap",
                transition: "none",
              }}
            >
              <div>
                <label className="block text-sm">Start Date</label>
                <Flatpickr
                  value={startDate}
                  onChange={([date]) => setStartDate(date)}
                  options={{ dateFormat: "Y-m-d", allowInput: false }}
                  className="border p-1 rounded w-32"
                />
              </div>

              <div>
                <label className="block text-sm">End Date</label>
                <Flatpickr
                  value={endDate}
                  onChange={([date]) => setEndDate(date)}
                  options={{ dateFormat: "Y-m-d", allowInput: false }}
                  className="border p-1 rounded w-32"
                />
              </div>

              <div className="">
                <label className="block text-sm">Data By</label>
                <Select
                  options={filenames}
                  value={filenames.find((f) => f.value === filename) || null}
                  onChange={(option) => setFilename(option ? option.value : "")}
                  isClearable
                  placeholder="Pilih filename..."
                />
              </div>
              <button
                onClick={onSearch}
                type="submit"
                class="p-2.5 mt-3 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                <svg
                  class="w-4 h-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
                <span class="sr-only">Search</span>
              </button>
            </div>
          </div>

          {/* Export buttons */}
          <div className="relative inline-block text-left mb-4" ref={exportRef}>
            <div>
              <button
                onClick={() => setIsExportOpen((prev) => !prev)}
                className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none"
              >
                Export
                <svg
                  className="-mr-1 ml-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {isExportOpen && (
              <div
                className="origin-top-left absolute left-0 mt-2 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                role="menu"
              >
                <div className="py-1" role="none">
                  {["csv", "json", "txt", "sql"].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        exportData(type);
                        setIsExportOpen(false);
                      }}
                      className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100"
                      role="menuitem"
                    >
                      Export as {type.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            data={products}
            pagination
            paginationServer
            paginationTotalRows={totalRows}
            paginationDefaultPage={currentPage}
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handlePerRowsChange}
            highlightOnHover
            striped
            responsive
            noDataComponent="Tidak ada data"
          />

          {/* Modal */}
          {modalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white p-4 rounded shadow max-w-lg w-full relative">
                <h2 className="text-xl font-bold mb-4">
                  Detail Produk - {modalContent?.product_number}
                </h2>
                <pre className="whitespace-pre-wrap">
                  {modalContent?.description}
                </pre>
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
    </>
  );
}

export default Data;
