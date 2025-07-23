import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useDropzone } from "react-dropzone";
import Navbar from "../components/Navbar";
import { Helmet } from "react-helmet";
import $ from "jquery";
import { API_BASE } from "../config/api";

const Convert = () => {
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);

  const [textData, setTextData] = useState("");
  const [werValue, setWerValue] = useState(null);
  const [werPerLine, setWerPerLine] = useState(null);
  const [editableLines, setEditableLines] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [fileCsv, setFileCsv] = useState(null);
  const [alert, setAlert] = useState(null);
  const [showOutput, setShowOutput] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const textAreaRef = useRef(null);
  const [hovering, setHovering] = useState(false);

  const uploadFileInChunks = async (file) => {
    const chunkSize = 16 * 1024; // 1MB
    const totalChunks = Math.ceil(file.size / chunkSize);
    const fileId = crypto.randomUUID(); // identitas file unik

    for (let i = 0; i < totalChunks; i++) {
      const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize);

      const formData = new FormData();
      formData.append("file", chunk);
      formData.append("filename", file.name);
      formData.append("uuid", fileId);
      formData.append("index", i);
      formData.append("totalChunks", totalChunks);

      const res = await fetch(`${API_BASE}/submit`, {
        method: "POST",
        body: formData,
        credentials:"include"
      });

      if (!res.ok) throw new Error(`Chunk ${i} failed`);
      if(i === totalChunks - 1){
        const result = await res.json();
        return result;
      }
    }

  };

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    MySwal.fire({
      title: "Processing...",
      html: (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <img
            src="/static/assets/Animation.gif"
            alt="Loading..."
            style={{ width: 100, height: 100, marginBottom: 10 }}
          />
          <p>Uploading file in chunks, please wait...</p>
        </div>
      ),
      allowOutsideClick: false,
      showConfirmButton: false,
    });

    try {
      const response = await uploadFileInChunks(file);

      MySwal.close();
      if (response.text && response.text.trim() !== "") {
        setTextData(response.text);
        if (response.wer !== undefined && response.wer !== null)
          setWerValue(response.wer);
        if (response.wer_per_line) setWerPerLine(response.wer_per_line);
        setShowOutput(true);
        setAlert({
          type: "success",
          message: "Convert Completed",
          filecsv: response.filecsv,
        });
        setFileCsv(response.filecsv);
        setEditableLines({});
        setIsEditing(false);
      } else {
        setAlert({ type: "error", message: "Tidak ada data yang diekstrak." });
      }
    } catch (error) {
      MySwal.close();
      console.error(error);
      setAlert({ type: "error", message: "Gagal mengunggah file." });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "image/webp": [".webp"] },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024, // 20MB
  });

  // Handler copy to clipboard
  const handleCopy = () => {
    if (!navigator.clipboard) {
      // fallback
      textAreaRef.current.select();
      document.execCommand("copy");
      Swal.fire({ icon: "success", text: "Teks disalin ke clipboard" });
      return;
    }
    navigator.clipboard.writeText(textData).then(
      () => {
        Swal.fire({ icon: "success", text: "Teks disalin ke clipboard" });
      },
      () => {
        Swal.fire({ icon: "error", text: "Gagal menyalin teks" });
      }
    );
  };

  // Toggle editing contenteditable spans
  const toggleEdit = () => {
    if (isEditing) {
      // Save edits to werPerLine data
      if (!werPerLine) return;
      const newWerData = [...werPerLine];
      for (const [idx, newText] of Object.entries(editableLines)) {
        const index = Number(idx);
        if (Array.isArray(newWerData[index])) {
          newWerData[index][1] = newText;
          newWerData[index][2] = 0; // reset error
        }
      }
      setWerPerLine(newWerData);
      setIsEditing(false);
      Swal.fire({ icon: "success", text: "Perubahan telah disimpan" });
      setEditableLines({});
    } else {
      setIsEditing(true);
    }
  };

  // Handle inline editing content change
  const handleContentChange = (idx, e) => {
    const newText = e.target.innerText;
    setEditableLines((prev) => ({ ...prev, [idx]: newText }));
  };

  // Save data to backend
 const handleSave = (onSuccessNavigate) => {
  if (!fileCsv) return;

Swal.fire({
        title: "Menyimpan...",
        html: `
      <div style="display: flex; flex-direction: column; align-items: center;">
        <img src="static/assets/searchdocument.gif" alt="Loading..." style="width: 300px; height: 100px; margin-bottom: 10px;">
        <p>Please wait, is saving to the database...</p>
      </div>
    `,
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

  $.ajax({
    url: `${API_BASE}/save/${fileCsv}`,
    method: "POST",
    contentType: "application/json",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    data: JSON.stringify({
      mode: "product",
      text: textData,
      wer_per_line: JSON.stringify(werPerLine),
    }),
    success: function (response) {
      Swal.close();
      if (response.status === "success") {
        Swal.fire({ icon: "success", text: response.message });
        setFileCsv(response.csv);
        setAlert(null);
        if (onSuccessNavigate) onSuccessNavigate();
      } else if (response.status === "error_blur") {
        // fallback simpan blur
        $.ajax({
          url: `${API_BASE}/save/${fileCsv}`,
          method: "POST",
          contentType: "application/json",
          credentials:"include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          data: JSON.stringify({
            mode: "blur",
            text: textData,
          }),
          success: function (res2) {
            Swal.close();
            if (res2.status === "success") {
              Swal.fire({
                icon: "success",
                text: "Data Telah Disimpan ke Table blur",
              });
              setFileCsv(res2.csv);
              if(onSuccessNavigate) onSuccessNavigate();
            } else {
              Swal.fire({ icon: "error", text: res2.message });
            }
          },
          error: function () {
            Swal.close();
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Gagal menyimpan ke mode blur.",
            });
          },
        });
      } else {
        Swal.fire({ icon: "error", text: response.message });
      }
    },
    error: function () {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Terjadi kesalahan.",
      });
    },
  });
};

  // Show data button click handler
  const handleShowData = () => {
    if (fileCsv) {
      if (alert && alert.type === "success") {
        MySwal.fire({
          title: "Data belum disimpan",
          text: "Apakah Anda ingin menyimpan terlebih dahulu sebelum melihat data?",
          icon: "warning",
          showDenyButton: true,
          confirmButtonText: "Save & Continue",
          denyButtonText: "Continue Without Saving",
          allowOutsideClick: false,
        }).then((result) => {
          if (result.isConfirmed) {
            handleSave(() => {
              navigate("/data");
            })
          } else if (result.isDenied) {
            navigate("/data");
          }
        });
      } else {
        navigate("/data");
      }
    }
  };

  // Render werPerLine content with highlighting and editable spans
  const renderOcrOutput = () => {
    if (!werPerLine) return null;
    return werPerLine.map((row, idx) => {
      const [_, text, wer] = row;
      const isInaccurate = wer > 0.1;
      const style = isInaccurate
        ? { backgroundColor: "#ffe0e0", color: "#b91c1c" }
        : {};
      return (
        <span
          key={idx}
          contentEditable={isEditing}
          suppressContentEditableWarning={true}
          style={style}
          title={
            isInaccurate
              ? `Baris kurang akurat (WER: ${(wer * 100).toFixed(2)}%)`
              : ""
          }
          onInput={(e) => handleContentChange(idx, e)}
          data-index={idx}
        >
          {text}
          <br />
        </span>
      );
    });
  };

  return (
    <>
      <Helmet>
        <title>Ocr Convert - Upload</title>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-white">
        <Navbar />
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-white py-20 px-4">
          <h1 className="text-gray-900 text-xl my-10 font-medium title-font">
            PDF to SQL Data Extraction Tool
          </h1>

          <div className="lg:w-1/3 md:w-1/2 bg-white rounded-lg p-8 flex flex-col w-full relative shadow-md">
            {alert && (
              <div
                className={`p-4 mb-2 rounded ${
                  alert.type === "success"
                    ? "bg-green-200 text-green-800"
                    : "bg-red-200 text-red-800"
                }`}
              >
                <h1 className="text-base font-semibold">
                  {alert.type === "success"
                    ? "Convert Completed"
                    : "Error Occurred"}
                </h1>
                <p className="mt-2">{alert.message}</p>
                {alert.type === "success" && fileCsv && (
                  <div className="mt-3 space-x-2 flex flex-wrap gap-2">
                    <a
                      href={`/download/${fileCsv}`}
                      className="text-green-800 font-semibold py-1 px-2 rounded hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Download CSV
                    </a>
                    <button
                      onClick={handleShowData}
                      className="text-green-800 font-semibold py-1 px-2 rounded hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Tampilkan Data
                    </button>
                    <button
                      onClick={handleSave}
                      className="text-green-800 font-semibold py-1 px-2 rounded hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Background Image */}
            <img
              src="/static/assets/images.jpg"
              alt="Background"
              className="absolute inset-0 opacity-10 z-0 object-cover rounded-lg pointer-events-none"
              style={{ userSelect: "none" }}
            />

            {/* Dropzone */}
            <div
              {...getRootProps()}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              className={`relative dropzone border-2 border-dashed rounded-md p-8 text-center transition-all duration-300 ${
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-400 bg-white"
              }`}
              style={{ cursor: "pointer", overflow: "hidden" }}
            >
              <input {...getInputProps()} />

              {/* ICON - Muncul dari tengah */}
              <div
                style={{
                  opacity: hovering ? 1 : 0,
                  transform: hovering ? "scale(1)" : "scale(0)",
                  transition: "all 0.3s ease",
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <i
                  className="bi bi-cloud-arrow-up-fill position-absolute"
                  style={{ fontSize: "3rem" }}
                ></i>
              </div>

              {/* TEXT - Atas (slide kiri) */}
              <p
                style={{
                  transform: hovering ? "translateX(-100%)" : "translateX(0)",
                  opacity: hovering ? 0 : 1,
                  transition: "all 0.3s ease",
                  fontWeight: "600",
                  color: "#111827",
                  marginTop: "12px",
                }}
              >
                Drop files here or click to upload.
              </p>

              {/* TEXT - Bawah (slide kanan) */}
              <p
                style={{
                  transform: hovering ? "translateX(100%)" : "translateX(0)",
                  opacity: hovering ? 0 : 1,
                  transition: "all 0.3s ease",
                  color: "#6b7280",
                  marginTop: "4px",
                }}
              >
                File anda akan otomatis di convert
              </p>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Masukan file pdf untuk mendownload data csv yang disimpan di
              PostgreSQL
            </p>
          </div>

          {/* Output Section */}
          {showOutput && (
            <>
              <hr className="my-8 border-gray-300 w-full max-w-6xl" />
              <div className="w-full max-w-6xl bg-white rounded-lg p-8 relative z-10">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xl font-medium font-sans block">
                    Output OCR - Preview
                  </span>
                  <button
                    onClick={() => {
                      setModalContent(textData);
                      setModalTitle("Output OCR - Full View");
                    }}
                    className="relative group border border-indigo-600 text-indigo-600 bg-white font-semibold py-0.5 px-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-200 hover:bg-indigo-600 hover:text-white transition-colors duration-200"
                    style={{ height: 28, minWidth: 28 }}
                  >
                    <i className="bi bi-arrows-angle-expand"></i>
                  </button>
                </div>
                <div className="flex gap-4 flex-wrap">
                  <textarea
                    ref={textAreaRef}
                    className="border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 flex-1"
                    style={{
                      minHeight: 250,
                      padding: 10,
                      resize: "vertical",
                      width: "100%",
                    }}
                    value={textData}
                    onChange={(e) => setTextData(e.target.value)}
                    readOnly={!isEditing}
                  />

                  <div
                    id="ocr-output"
                    className="border border-gray-300 rounded p-2 flex-1 overflow-y-auto"
                    style={{
                      minHeight: 250,
                      maxWidth: "100%",
                      whiteSpace: "pre-wrap",
                    }}
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                  >
                    {renderOcrOutput()}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleCopy}
                      className="relative group border-2 border-indigo-600 text-indigo-600 bg-white font-semibold py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-200 hover:bg-indigo-600 hover:text-white transition-colors duration-200"
                      style={{ height: 40 }}
                      title="Copy"
                    >
                      <i className="fa-regular fa-copy"></i>
                    </button>

                    {isEditing ? (
                      <button
                        onClick={toggleEdit}
                        className="border-2 border-green-600 text-green-600 bg-white font-semibold py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-green-200 hover:bg-green-600 hover:text-white transition-colors duration-200"
                        style={{ height: 40 }}
                        title="Finish Editing"
                      >
                        <i className="fas fa-save"></i>
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="border-2 border-indigo-600 text-indigo-600 bg-white font-semibold py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-200 hover:bg-indigo-600 hover:text-white transition-colors duration-200"
                        style={{ height: 40 }}
                        title="Edit"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    )}
                  </div>
                </div>
                {werValue !== null && (
                  <p className="text-sm text-gray-500 mt-3">
                    WER: {(werValue * 100).toFixed(2)}%
                  </p>
                )}
              </div>
            </>
          )}

          {/* Modal */}
          {modalContent && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setModalContent("")}
            >
              <div
                className="bg-white rounded-lg p-6 max-w-5xl max-h-[90vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-semibold mb-4">{modalTitle}</h2>
                <pre style={{ whiteSpace: "pre-wrap", fontSize: "1.1em" }}>
                  {modalContent}
                </pre>
                <button
                  onClick={() => setModalContent("")}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
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
};

export default Convert;
