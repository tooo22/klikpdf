import React, { useState } from 'react';
import { TOOLS } from '../toolsConfig';
import { Dropzone } from '../components/Dropzone';
import { PageGridPreview } from '../components/PageGridPreview';
import { ActionSidebar } from '../components/ActionSidebar';
import { ResultDownload } from '../components/ResultDownload';
import { Toast } from '../components/Toast';
import { processPdfTool } from '../services/api';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const ToolWorkspace = ({ toolId, onGoHome }) => {
  const { lang } = useLanguage();
  const tool = TOOLS.find((t) => t.id === toolId) || TOOLS[0];
  const [selectedFiles, setSelectedFiles] = useState([]);
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

    const formData = new FormData();
    if (tool.multipleFiles) {
      selectedFiles.forEach((file) => formData.append('files', file));
    } else {
      formData.append('file', selectedFiles[0]);
    }

    if (options.watermarkText) formData.append('text', options.watermarkText);
    if (options.password) formData.append('password', options.password);
    if (options.ranges) formData.append('ranges', options.ranges);

    try {
      const blob = await processPdfTool(tool.endpoint, formData);
      const url = window.URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || "Gagal memproses dokumen. Periksa kembali file Anda.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (resultUrl) {
    return (
      <ResultDownload
        downloadUrl={resultUrl}
        fileName={`klikpdf_${tool.id}.pdf`}
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
