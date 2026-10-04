import React, { useState } from 'react';
import { TOOLS } from '../toolsConfig';
import { Dropzone } from '../components/Dropzone';
import { PageGridPreview } from '../components/PageGridPreview';
import { ActionSidebar } from '../components/ActionSidebar';
import { ResultDownload } from '../components/ResultDownload';
import { Toast } from '../components/Toast';
import { processPdfTool } from '../services/api';
import { 
  clientWordToPdf, 
  clientMergePdfs, 
  clientSplitPdf, 
  clientRotatePdf, 
  clientWatermarkPdf, 
  clientImageToPdf, 
  clientHdImage 
} from '../services/clientPdfProcessor';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const ToolWorkspace = ({ toolId, onGoHome, initialFiles = [] }) => {
  const { lang } = useLanguage();
  const { addRecentFile } = useAuth();
  const tool = TOOLS.find((t) => t.id === toolId) || TOOLS[0];
  const [selectedFiles, setSelectedFiles] = useState(initialFiles || []);
  const [options, setOptions] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleFilesSelected = (files) => {
    setSelectedFiles(files);
  };

  const handleProcess = async () => {
    if (selectedFiles.length === 0) {
      setErrorMessage(lang === 'id' ? "Silakan pilih berkas terlebih dahulu." : "Please select a file first.");
      return;
    }

    if (tool.id === 'protect' && (!options.password || !options.password.trim())) {
      setErrorMessage(lang === 'id' ? "Silakan masukkan kata sandi untuk mengunci berkas PDF." : "Please enter a password to protect the PDF file.");
      return;
    }

    if (tool.id === 'unlock' && (!options.password || !options.password.trim())) {
      setErrorMessage(lang === 'id' ? "Silakan masukkan kata sandi untuk membuka proteksi berkas PDF." : "Please enter the password to unlock the PDF file.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      let blob = null;

      // 1. Instant Client-Side Processing Engine (Zero server dependency)
      if (tool.id === 'word-to-pdf') {
        blob = await clientWordToPdf(selectedFiles[0]);
      } else if (tool.id === 'merge') {
        blob = await clientMergePdfs(selectedFiles);
      } else if (tool.id === 'split') {
        blob = await clientSplitPdf(selectedFiles[0], options.ranges);
      } else if (tool.id === 'rotate') {
        blob = await clientRotatePdf(selectedFiles[0], 90);
      } else if (tool.id === 'watermark') {
        blob = await clientWatermarkPdf(selectedFiles[0], options.watermarkText);
      } else if (tool.id === 'image-to-pdf') {
        blob = await clientImageToPdf(selectedFiles);
      } else if (tool.id === 'hd-image') {
        blob = await clientHdImage(selectedFiles[0], options.scale || 2);
      } else {
        // 2. Server API fallback
        const formData = new FormData();
        if (tool.multipleFiles) {
          selectedFiles.forEach((file) => formData.append('files', file));
        } else {
          formData.append('file', selectedFiles[0]);
        }

        if (options.watermarkText) formData.append('text', options.watermarkText);
        if (options.password) formData.append('password', options.password);
        if (options.ranges) formData.append('ranges', options.ranges);
        if (options.quality) formData.append('quality', options.quality);
        if (options.scale) formData.append('scale', options.scale.toString());
        if (options.level) formData.append('level', options.level);
        if (options.position) formData.append('position', options.position);

        blob = await processPdfTool(tool.endpoint, formData);
      }

      if (blob) {
        const url = window.URL.createObjectURL(blob);
        setResultUrl(url);
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

        // Record to user's recent file history
        try {
          addRecentFile({
            name: selectedFiles[0]?.name || 'Dokumen.pdf',
            toolName: lang === 'id' ? (tool.nameId || tool.name) : tool.name,
            size: selectedFiles[0]?.size ? (selectedFiles[0].size / 1024 / 1024).toFixed(2) + ' MB' : '-'
          });
        } catch (e) {
          console.warn("Could not save to recent files:", e);
        }
      } else {
        throw new Error("Gagal menghasilkan berkas PDF.");
      }
    } catch (err) {
      console.error("Processing error:", err);
      let msg = err.response?.data?.detail;
      if (!msg) {
        if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error') || !err.response) {
          msg = lang === 'id'
            ? "Server backend (Port 8000) belum berjalan. Silakan jalankan backend terlebih dahulu (python run.py di folder backend) untuk fitur ini."
            : "Backend server (Port 8000) is offline. Please start backend first (python run.py in backend folder) to use this feature.";
        } else {
          msg = err.message || (lang === 'id' ? "Gagal memproses dokumen. Periksa kembali file Anda." : "Failed to process document. Please check your file.");
        }
      }
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (resultUrl) {
    const firstFileName = selectedFiles[0]?.name || '';
    const lastDotIdx = firstFileName.lastIndexOf('.');
    const baseName = lastDotIdx > 0 ? firstFileName.substring(0, lastDotIdx) : (firstFileName || 'dokumen');

    let ext = 'pdf';
    if (tool.id === 'hd-image') ext = 'png';
    else if (tool.id === 'pdf-to-word') ext = 'docx';
    else if (tool.id === 'pdf-to-excel') ext = 'xlsx';
    else if (tool.id === 'pdf-to-image') ext = 'zip';
    else ext = 'pdf';

    let finalFileName = `${baseName}.${ext}`;
    if (tool.id === 'merge') {
      finalFileName = selectedFiles.length > 1 ? `${baseName}_merged.${ext}` : `${baseName}.${ext}`;
    } else if (tool.id === 'split') {
      finalFileName = `${baseName}_split.${ext}`;
    } else if (tool.id === 'compress') {
      finalFileName = `${baseName}_compressed.${ext}`;
    } else if (tool.id === 'rotate') {
      finalFileName = `${baseName}_rotated.${ext}`;
    } else if (tool.id === 'watermark') {
      finalFileName = `${baseName}_watermark.${ext}`;
    } else if (tool.id === 'page-numbers') {
      finalFileName = `${baseName}_numbered.${ext}`;
    } else if (tool.id === 'hd-image') {
      finalFileName = `${baseName}_hd.${ext}`;
    }

    return (
      <ResultDownload
        downloadUrl={resultUrl}
        fileName={finalFileName}
        toolName={tool.title}
        onGoHome={onGoHome}
        onReset={() => {
          setSelectedFiles([]);
          setResultUrl(null);
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }}
      />
    );
  }

  if (selectedFiles.length === 0) {
    return (
      <>
        <Dropzone tool={tool} onFilesSelected={handleFilesSelected} onGoHome={onGoHome} />
        <Toast message={errorMessage} onClose={() => setErrorMessage(null)} />
      </>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      <div className="flex-1 bg-slate-50 dark:bg-[#090D16] flex flex-col transition-colors duration-200">
        {/* Top bar with back button */}
        <div className="p-3 sm:p-4 bg-white/80 dark:bg-[#0E1320]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between">
          <button
            onClick={onGoHome}
            className="aura-pill inline-flex items-center space-x-1.5 sm:space-x-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary bg-white/90 dark:bg-white/[0.06] px-3.5 py-1.5 rounded-full border border-slate-200/80 dark:border-white/10 shadow-2xs transition-all cursor-pointer group active:scale-95"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform shrink-0" />
            <span className="hidden sm:inline">{lang === 'id' ? 'Kembali ke Semua Alat' : 'Back to All Tools'}</span>
            <span className="sm:hidden">{lang === 'id' ? 'Kembali' : 'Back'}</span>
          </button>
          <span className="aura-pill px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">
            {selectedFiles.length} {lang === 'id' ? 'berkas dipilih' : 'files selected'}
          </span>
        </div>

        <PageGridPreview
          files={selectedFiles}
          onRotate={() => {}}
          onDelete={(idx) => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
        />
      </div>
      <ActionSidebar
        tool={tool}
        options={options}
        onOptionsChange={setOptions}
        onProcess={handleProcess}
        isProcessing={isProcessing}
      />
      <Toast message={errorMessage} onClose={() => setErrorMessage(null)} />
    </div>
  );
};
