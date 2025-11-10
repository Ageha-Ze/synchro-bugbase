"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, UploadCloud, Loader2, Table } from "lucide-react";
import * as XLSX from "xlsx";
import supabaseBrowser from "@/lib/supabaseBrowser";
import ClientConnectionHandler from "@/components/ClientConnectionHandler";
import type { NewBug } from "@/lib/bugs"; // ✅ Import dari bugs.ts

interface ImportBugModalProps {
  projectId: string;
  onClose: () => void;
  onImport: (bugs: NewBug[]) => void;
}

export default function ImportBugModal({
  onClose,
  onImport,
  projectId,
}: ImportBugModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const supabase = supabaseBrowser;

  useEffect(() => setIsVisible(true), []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
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
      setPreviewData(jsonData.length > 0 ? jsonData.slice(0, 5) : []);
    }
  };

const handleImport = async () => {
  if (!file) return alert("Please select a file first.");
  setLoading(true);

  try {
    // Ambil nomor project
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("project_number")
      .eq("id", projectId)
      .single();

    if (projectError) throw projectError;
    if (!projectData) throw new Error("Project not found");

    const projectNumber = projectData.project_number ?? 1;

    // Ambil nomor bug terakhir
    const { data: lastBug, error: lastBugError } = await supabase
      .from("bugs")
      .select("bug_number")
      .eq("project_id", projectId)
      .order("bug_number", { ascending: false })
      .limit(1)
      .single();

    if (lastBugError && lastBugError.code !== "PGRST116") throw lastBugError;

    let nextNumber = lastBug?.bug_number ? lastBug.bug_number + 1 : 1;

    // Baca file Excel
    const dataBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(dataBuffer, { type: "array" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

    if (jsonData.length === 0) return alert("No data found in file.");

    // Map ke NewBug
  const formatted: NewBug[] = jsonData.map((row) => {
  const bugNum = nextNumber++;
  const title = row.Title?.toString().trim() || "Untitled Bug";

  return {
    bug_number: bugNum,
    bug_id: `SCB-${String(projectNumber).padStart(2, "0")}-${String(bugNum).padStart(3, "0")}`,
    title,
    description: row.Description?.toString().trim() || "",
    severity: (row.Severity as NewBug["severity"]) || "Medium",
    priority: (row.Priority as NewBug["priority"]) || "Medium",
    status: (row.Status as NewBug["status"]) || "New",
    result: (row.Result as NewBug["result"]) || "To-Do",
    steps_to_reproduce: row.Steps_to_reproduce?.toString().trim() || "",
    expected_result: row.Expected_result?.toString().trim() || "",
    actual_result: row.Actual_result?.toString().trim() || "",
    project_id: projectId,
     project: {               // ✅ tambah ini
      id: projectId,
      name: "Unknown",       // bisa diganti dengan nama project jika ada fetch tambahan
      project_number: projectNumber,
    },
    assigned_to: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: "system", // ✅ tambah created_by
  };
});


    // Insert ke Supabase
    const { data: insertedBugs, error: insertError } = await supabase
  .from("bugs")
  .insert(formatted)
  .select("id, bug_number, bug_id");

if (insertError) throw insertError;
if (!insertedBugs || insertedBugs.length === 0)
  throw new Error("No bugs were inserted");

    // gabungkan data baru dengan ID dari Supabase
    const bugsWithIds: NewBug[] = formatted.map((bug, i) => ({
  ...bug,
  id: insertedBugs[i]?.id || "", // ID dari Supabase
  }));

onImport(bugsWithIds);

    // Insert attachment jika ada
const attachmentRows: any[] = [];
jsonData.forEach((row, i) => {
  const attachment = row.Attachment?.toString().trim();
  if (attachment) {
    const bug = insertedBugs[i]; // ambil id Supabase
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
  await supabase.from("attachments").insert(attachmentRows);
}

   onImport(formatted); // <-- pakai formatted, bukan insertedBugs
   handleClose();
  alert(`✅ Imported ${formatted.length} bugs successfully.`);
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
              Columns required: <br />
              <code>
                Title, Description, Severity, Priority, Status, Result,
                Steps_to_reproduce, Expected_result, Actual_result, Attachment
              </code>
            </p>
          </div>

          {/* File input */}
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
                <span className="text-lg font-semibold">
                  Click to select file
                </span>
                <span className="text-sm text-gray-400">
                  (Excel .xlsx / .xls / .csv)
                </span>
              </p>
            )}
          </label>

          {/* Preview */}
          {previewData.length > 0 && (
            <div className="border border-indigo-100 rounded-xl p-4 mb-6 bg-indigo-50/30 overflow-x-auto">
              <div className="flex items-center gap-2 mb-3">
                <Table className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-700">
                  Preview (first 5 rows)
                </h3>
              </div>
              <table className="min-w-full text-sm text-left border border-indigo-100 rounded-lg overflow-hidden">
                <thead className="bg-indigo-100 text-indigo-800 font-semibold">
                  <tr>
                    {Object.keys(previewData[0]).map((key) => (
                      <th
                        key={key}
                        className="px-3 py-2 border-b border-indigo-200"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, i) => (
                    <tr key={i} className="even:bg-white odd:bg-indigo-50/40">
                      {Object.values(row).map((val, j) => (
                        <td
                          key={j}
                          className="px-3 py-2 text-gray-700 border-b border-indigo-100"
                        >
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
      </div>
    </ClientConnectionHandler>
  );
}
