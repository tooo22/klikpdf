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
      setErrorMessage("Silakan pilih file terlebih dahulu.");
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

        blob = await processPdfTool(tool.endpoint, formData);
      }

      if (blob) {
        const url = window.URL.createObjectURL(blob);
        setResultUrl(url);

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
      setErrorMessage(err.response?.data?.detail || err.message || "Gagal memproses dokumen. Periksa kembali file Anda.");
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
    } else if (tool.id === 'hd-image') {
      finalFileName = `${baseName}_hd.${ext}`;
    }

    return (
      <ResultDownload
        downloadUrl={resultUrl}
        fileName={finalFileName}
        onGoHome={onGoHome}
        onReset={() => {
          setSelectedFiles([]);
          setResultUrl(null);
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
      <div className="flex-1 bg-[#F4F5F7] dark:bg-[#121214] flex flex-col transition-colors duration-200">
        {/* Top bar with back button */}
        <div className="p-4 bg-white/60 dark:bg-[#1E1E22]/80 border-b border-gray-200/80 dark:border-[#27272A] flex items-center justify-between">
          <button
            onClick={onGoHome}
            className="inline-flex items-center space-x-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-[#E5322D] dark:hover:text-[#E5322D] bg-white dark:bg-[#1E1E22] px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#27272A] shadow-sm transition-all cursor-pointer group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>{lang === 'id' ? 'Kembali ke Semua Alat' : 'Back to All Tools'}</span>
          </button>
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
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
