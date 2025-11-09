"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, UploadCloud, Loader2, Table } from "lucide-react";
import * as XLSX from "xlsx";
import { createBrowserSupabaseClient } from "@/lib/supabaseBrowser";
import ClientConnectionHandler from "@/components/ClientConnectionHandler";

export default function ImportBugModal({ onClose, onImport, projectId }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    setIsVisible(true); // trigger fade/slide in
  }, []);

  const handleClose = () => {
    setIsVisible(false); // trigger fade/slide out
    setTimeout(() => onClose(), 300); // tunggu animasi selesai
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);

      const data = await selected.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length > 0) {
        setPreviewData(jsonData.slice(0, 5));
      } else {
        alert("File tidak mengandung data.");
        setPreviewData([]);
      }
    }
  };

 const handleImport = async () => {
  if (!file) return alert("Please select a file first.");
  setLoading(true);

  try {
    // Baca file
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      alert("No data found in the file.");
      return;
    }

    // Ambil project_number dari project yang dipilih
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("project_number")
      .eq("id", projectId)
      .single();
    if (projectError) throw projectError;
    const projectNumber = projectData.project_number;

    // Ambil bug_number terakhir
    const { data: lastBug } = await supabase
      .from("bugs")
      .select("bug_number")
      .order("bug_number", { ascending: false })
      .limit(1)
      .single();
    let nextNumber = lastBug?.bug_number ? lastBug.bug_number + 1 : 1;

    // Format data untuk insert
    const formatted = (jsonData as any[]).map((row) => ({
      bug_number: nextNumber++, // nomor bug unik
      bug_id: `${projectNumber}-${nextNumber}`, // gabung project_number + bug_number
      title: row.Title || "Untitled Bug",
      description: row.Description || "",
      severity: row.Severity || "Medium",
      priority: row.Priority || "Medium",
      status: row.Status || "New",
      result: row.Result || "To-Do",
      steps_to_reproduce: row.Steps_to_reproduce || "",
      expected_result: row.Expected_result || "",
      actual_result: row.Actual_result || "",
      project_id: projectId,
    }));

    const { data: insertedBugs, error } = await supabase
      .from("bugs")
      .insert(formatted)
      .select("id, bug_number, bug_id");

    if (error) throw error;

    // Insert attachments jika ada
    const attachmentRows: any[] = [];
    (jsonData as any[]).forEach((row, i) => {
      const attachment = row.Attachment?.trim();
      if (attachment) {
        const bug = insertedBugs[i];
        if (bug?.id) {
          attachmentRows.push({
            bug_id: bug.id,
            type: "link",
            url: attachment,
          });
        }
      }
    });

    if (attachmentRows.length > 0) {
      const { error: attachError } = await supabase
        .from("attachments")
        .insert(attachmentRows);
      if (attachError) throw attachError;
    }

    onImport(insertedBugs);
    handleClose();
    alert(`✅ Imported ${insertedBugs.length} bugs successfully.`);
  } catch (err: any) {
    console.error(err);
    alert("Error importing data: " + err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <ClientConnectionHandler>
    <div
      onClick={handleOverlayClick}
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 pt-20 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 relative transform transition-all duration-300 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <UploadCloud className="w-12 h-12 mx-auto text-indigo-600 mb-2" />
          <h2 className="text-2xl font-bold text-gray-800">
            Import Bugs from Excel / CSV
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Columns required:
            <br />
            <code>
              Title, Description, Severity, Priority, Status, Result, Steps_to_reproduce, Expected_result, Actual_result, Attachment
            </code>
          </p>
        </div>

        {/* File Input */}
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-300 rounded-xl p-6 text-gray-600 hover:bg-indigo-50 cursor-pointer transition mb-6">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileChange}
          />
          {file ? (
            <p className="font-semibold text-indigo-600">{file.name}</p>
          ) : (
            <p className="flex flex-col items-center">
              <span className="text-lg font-semibold">Click to select file</span>
              <span className="text-sm text-gray-400">
                (Excel .xlsx / .xls / .csv)
              </span>
            </p>
          )}
        </label>

        {/* Preview Section */}
        {previewData.length > 0 && (
          <div className="border border-indigo-100 rounded-xl p-4 mb-6 bg-indigo-50/30 overflow-x-auto">
            <div className="flex items-center gap-2 mb-3">
              <Table className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-gray-700">Preview (first 5 rows)</h3>
            </div>
            <table className="min-w-full text-sm text-left border border-indigo-100 rounded-lg overflow-hidden">
              <thead className="bg-indigo-100 text-indigo-800 font-semibold">
                <tr>
                  {Object.keys(previewData[0]).map((key) => (
                    <th key={key} className="px-3 py-2 border-b border-indigo-200">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, i) => (
                  <tr key={i} className="even:bg-white odd:bg-indigo-50/40">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="px-3 py-2 text-gray-700 border-b border-indigo-100">
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300 text-gray-700"
          >
            Cancel
          </Button>
          <Button
            disabled={!file || loading}
            onClick={handleImport}
            className={`bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-md ${
              !file ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Importing...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4 mr-2" /> Import Now
              </>
            )}
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </div>
    </ClientConnectionHandler>
  );
}
