import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useCrm } from '../context/CrmContext';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle, 
  FileCheck, 
  Download, 
  Table, 
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

export const BulkUploadModal = ({ isOpen, onClose, onFinishGoToCustomers }) => {
  const { bulkUploadCustomers, setActiveTab, addToast } = useCrm();

  const fileInputRef = useRef(null);

  // States
  const [fileData, setFileData] = useState(null); // { fileName, fileSize, sheetNames, selectedSheet, rawRows, headers }
  const [columnMapping, setColumnMapping] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    source: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Auto-detect columns based on header strings
  const autoDetectColumns = (headers) => {
    const mapping = {
      name: '',
      phone: '',
      email: '',
      city: '',
      source: ''
    };

    headers.forEach(h => {
      const lower = String(h).toLowerCase().trim();
      if (!mapping.name && /name|customer|company|client|business|firm|account/i.test(lower)) {
        mapping.name = h;
      } else if (!mapping.phone && /phone|mobile|contact|cell|number|whatsapp|tel/i.test(lower)) {
        mapping.phone = h;
      } else if (!mapping.email && /email|mail/i.test(lower)) {
        mapping.email = h;
      } else if (!mapping.city && /city|location|address|region/i.test(lower)) {
        mapping.city = h;
      } else if (!mapping.source && /source|channel|origin|lead_source|campaign/i.test(lower)) {
        mapping.source = h;
      }
    });

    // Fallbacks if not auto-detected
    if (!mapping.name && headers.length > 0) mapping.name = headers[0];
    if (!mapping.phone && headers.length > 1) mapping.phone = headers[1];
    if (!mapping.email && headers.length > 2) mapping.email = headers[2];

    return mapping;
  };

  // Handle actual file upload from user's computer
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setIsProcessing(true);

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary', cellDates: true });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Parse sheet to json
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          setErrorMsg('The selected Excel sheet appears to be empty. Please choose a sheet with data rows.');
          setIsProcessing(false);
          return;
        }

        // Get headers from first row keys
        const headers = Object.keys(rawJson[0]);
        const detectedMapping = autoDetectColumns(headers);

        setFileData({
          fileName: file.name,
          fileSize: (file.size / 1024).toFixed(1) + ' KB',
          workbook,
          sheetNames: workbook.SheetNames,
          selectedSheet: firstSheetName,
          rawRows: rawJson,
          headers
        });

        setColumnMapping(detectedMapping);
        setIsProcessing(false);
      } catch (err) {
        console.error('Excel parse error:', err);
        setErrorMsg('Could not parse this Excel/CSV file. Please ensure it is a valid .xlsx, .xls, or .csv document.');
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setErrorMsg('Failed to read the file from your computer.');
      setIsProcessing(false);
    };

    reader.readAsBinaryString(file);
  };

  // Switch sheet if multi-sheet Excel
  const handleSheetChange = (sheetName) => {
    if (!fileData?.workbook) return;
    try {
      const worksheet = fileData.workbook.Sheets[sheetName];
      const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      if (rawJson.length > 0) {
        const headers = Object.keys(rawJson[0]);
        setFileData(prev => ({
          ...prev,
          selectedSheet: sheetName,
          rawRows: rawJson,
          headers
        }));
        setColumnMapping(autoDetectColumns(headers));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Execute import of the parsed Excel data
  const handleConfirmImport = () => {
    if (!fileData || !fileData.rawRows.length) return;

    if (!columnMapping.name) {
      setErrorMsg('Please select which column contains the Customer/Company Name.');
      return;
    }

    const formattedRecords = fileData.rawRows.map(row => {
      return {
        name: String(row[columnMapping.name] || 'Unnamed Customer').trim(),
        phone: columnMapping.phone ? String(row[columnMapping.phone] || '').trim() : '0300-0000000',
        email: columnMapping.email ? String(row[columnMapping.email] || '').trim() : '',
        city: columnMapping.city ? String(row[columnMapping.city] || 'Karachi').trim() : 'Karachi',
        source: columnMapping.source && row[columnMapping.source] 
          ? String(row[columnMapping.source]).trim() 
          : 'Excel File Upload'
      };
    }).filter(r => r.name); // Ignore completely blank rows

    if (formattedRecords.length === 0) {
      setErrorMsg('No valid rows could be extracted with the selected columns.');
      return;
    }

    const imported = bulkUploadCustomers(formattedRecords, fileData.fileName);
    setImportedCount(imported.length);
    setImportSuccess(true);
  };

  // Generate and download a real sample Excel template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "Customer / Company Name": "Apex Global Traders",
        "Phone Number": "0300-1122334",
        "Email Address": "contact@apexglobal.pk",
        "City": "Karachi",
        "Lead Source": "Excel Import"
      },
      {
        "Customer / Company Name": "Pak Cloud Solutions",
        "Phone Number": "0321-4455667",
        "Email Address": "info@pakcloud.io",
        "City": "Lahore",
        "Lead Source": "Referral"
      },
      {
        "Customer / Company Name": "Indus Logistics Co.",
        "Phone Number": "0333-8899001",
        "Email Address": "dispatch@induslog.com",
        "City": "Islamabad",
        "Lead Source": "Direct Inbound"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers_Template");
    XLSX.writeFile(workbook, "OmniFlow_Customers_Template.xlsx");

    addToast({
      title: 'Template Downloaded',
      message: 'OmniFlow_Customers_Template.xlsx is saved to your computer.',
      type: 'success'
    });
  };

  // Reset & close
  const handleResetAndClose = () => {
    setFileData(null);
    setImportSuccess(false);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Excel / CSV File Importer (SheetJS Engine)
              </h3>
              <p className="text-xs text-slate-500">
                Upload your actual spreadsheet file (.xlsx, .xls, .csv) to populate the Raw Customers Pool
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Import Warning</p>
                <p className="text-[11px] mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {!importSuccess ? (
            <>
              {/* Step 1: Upload File Drag & Drop */}
              {!fileData ? (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/30 hover:bg-blue-50/50 rounded-2xl p-8 text-center cursor-pointer transition-all group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div className="mt-3 space-y-1">
                      <h4 className="text-sm font-bold text-slate-800">
                        Click to select your Excel file, or drag and drop here
                      </h4>
                      <p className="text-xs text-slate-500">
                        Supports <strong>.XLSX, .XLS, and .CSV</strong> spreadsheets
                      </p>
                    </div>
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-blue-700 font-semibold border border-blue-200 shadow-xs text-xs">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        Browse Files from Computer
                      </span>
                    </div>
                  </div>

                  {/* Template download & Help row */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <p className="font-bold text-slate-800">Need a sample format for your leads?</p>
                      <p className="text-[11px] text-slate-500">Download our formatted Excel template with sample corporate columns.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      <span>Download Template (.xlsx)</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Step 2: File Parsed - Column Mapping & Preview */
                <div className="space-y-4">
                  {/* Selected File Details Banner */}
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">
                          {fileData.fileName} <span className="text-slate-400 font-normal">({fileData.fileSize})</span>
                        </p>
                        <p className="text-[11px] text-emerald-700 font-medium">
                          Successfully parsed <strong>{fileData.rawRows.length} rows</strong> across <strong>{fileData.headers.length} columns</strong>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setFileData(null);
                        setErrorMsg('');
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Choose another file
                    </button>
                  </div>

                  {/* If multiple sheets, allow sheet selection */}
                  {fileData.sheetNames.length > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">Select Sheet:</span>
                      <select
                        value={fileData.selectedSheet}
                        onChange={(e) => handleSheetChange(e.target.value)}
                        className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                      >
                        {fileData.sheetNames.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Column Mapping Selectors */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                        <span>Map Spreadsheet Columns to Customer Fields</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                        Auto-detected
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* Name Column */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Customer / Company Name <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={columnMapping.name}
                          onChange={(e) => setColumnMapping({ ...columnMapping, name: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="">-- Select Column --</option>
                          {fileData.headers.map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>

                      {/* Phone Column */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Phone Number Column
                        </label>
                        <select
                          value={columnMapping.phone}
                          onChange={(e) => setColumnMapping({ ...columnMapping, phone: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="">-- None / Skip --</option>
                          {fileData.headers.map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>

                      {/* Email Column */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Email Address Column
                        </label>
                        <select
                          value={columnMapping.email}
                          onChange={(e) => setColumnMapping({ ...columnMapping, email: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="">-- None / Skip --</option>
                          {fileData.headers.map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>

                      {/* City Column */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          City / Region Column
                        </label>
                        <select
                          value={columnMapping.city}
                          onChange={(e) => setColumnMapping({ ...columnMapping, city: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="">-- Default (Karachi) --</option>
                          {fileData.headers.map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>

                      {/* Source Column */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Lead Source Column
                        </label>
                        <select
                          value={columnMapping.source}
                          onChange={(e) => setColumnMapping({ ...columnMapping, source: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="">-- Default (Excel Upload) --</option>
                          {fileData.headers.map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Live Data Preview Table (First 5 Rows from their Excel) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Table className="w-3.5 h-3.5 text-slate-500" />
                        First 5 Rows from Your Excel File:
                      </span>
                      <span className="text-slate-400 font-medium">
                        Showing preview of {fileData.rawRows.length} total rows
                      </span>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-[11px]">
                        <thead>
                          <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                            <th className="py-2 px-3">#</th>
                            <th className="py-2 px-3 font-semibold text-blue-700">Name ({columnMapping.name || '?'})</th>
                            <th className="py-2 px-3">Phone ({columnMapping.phone || '—'})</th>
                            <th className="py-2 px-3">Email ({columnMapping.email || '—'})</th>
                            <th className="py-2 px-3">City ({columnMapping.city || '—'})</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {fileData.rawRows.slice(0, 5).map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                              <td className="py-2 px-3 font-bold text-slate-800">
                                {String(row[columnMapping.name] || '—')}
                              </td>
                              <td className="py-2 px-3 font-mono text-slate-600">
                                {columnMapping.phone ? String(row[columnMapping.phone] || '—') : '—'}
                              </td>
                              <td className="py-2 px-3 text-slate-500 truncate max-w-xs">
                                {columnMapping.email ? String(row[columnMapping.email] || '—') : '—'}
                              </td>
                              <td className="py-2 px-3 text-slate-500">
                                {columnMapping.city ? String(row[columnMapping.city] || '—') : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Step 3: Success Screen */
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center ring-8 ring-emerald-50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Excel Import Successful!
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  <strong>{importedCount} customer records</strong> from your Excel sheet have been appended into the Raw Customers Data Pool with status <strong>"Unassigned"</strong>.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 text-left max-w-md mx-auto space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Ready for Agent Routing:</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Go to the <strong>Customers</strong> view to batch select your newly imported records and assign them to your sales agents (Bilal, Sara, Usman).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          {!importSuccess ? (
            <>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                Cancel
              </button>

              {fileData && (
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Import {fileData.rawRows.length} Records to Pool</span>
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                handleResetAndClose();
                if (onFinishGoToCustomers) {
                  onFinishGoToCustomers();
                } else {
                  setActiveTab('customers');
                }
              }}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
            >
              <span>View & Assign Customers Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
