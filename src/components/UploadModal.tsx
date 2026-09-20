import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  AlertCircle,
  ArrowRight,
  Scale,
} from 'lucide-react';
import { ALL_SAMPLE_CONTRACTS } from '../data/sampleContracts';
import { StructuredDocument } from '../types/legal';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentLoaded: (doc: StructuredDocument) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDocumentLoaded,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const text = await file.text();
      if (!text || text.trim().length < 50) {
        throw new Error('The file appears to be empty or unreadable.');
      }

      const res = await fetch('/api/documents/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: file.name,
          rawText: text,
          source: 'upload',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to parse document.');
      }

      const parsedDoc: StructuredDocument = await res.json();
      onDocumentLoaded(parsedDoc);
      onClose();
    } catch (err: any) {
      console.error('File parsing error:', err);
      setErrorMessage(
        err.message || 'Unable to parse this document. Please ensure it contains readable text.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSampleSelect = async (sample: typeof ALL_SAMPLE_CONTRACTS[0]) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/documents/load-sample/${sample.id}`, {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('Failed to load sample contract.');
      }

      const parsedDoc = await res.json();
      onDocumentLoaded(parsedDoc);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error loading sample document.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#09090B]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans select-none">
      <div className="bg-[#FFFFFF] w-full max-w-lg rounded-lg shadow-xl flex flex-col overflow-hidden border border-[#E4E4E7]">
        {/* Header */}
        <div className="p-4 border-b border-[#E4E4E7] flex items-center justify-between bg-[#FAFAF9]">
          <div>
            <h2 className="text-sm font-semibold text-[#09090B]">
              Upload Legal Contract
            </h2>
            <p className="text-xs text-[#71717A]">
              PDF, DOCX, or TXT (Lease, NDA, Service Agreement)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#71717A] hover:text-[#09090B] p-1 rounded hover:bg-[#E4E4E7]/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5">
          {/* Drag & Drop Zone */}
          <div
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-[#18181B] bg-[#F4F4F5]'
                : 'border-[#E4E4E7] hover:border-[#A1A1AA] bg-[#FAFAF9]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <div className="w-9 h-9 rounded bg-[#FFFFFF] border border-[#E4E4E7] flex items-center justify-center mx-auto mb-2.5 text-[#18181B]">
              <Upload className="w-4 h-4" />
            </div>
            <div className="font-medium text-xs text-[#09090B]">
              Click to select or drag and drop file
            </div>
            <p className="text-[11px] text-[#71717A] mt-0.5">
              Parsed locally into structured legal clauses
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded bg-[#FAFAF9] border border-[#E4E4E7] flex items-start gap-2 text-xs text-[#71717A]">
              <AlertCircle className="w-4 h-4 text-[#18181B] shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isProcessing && (
            <div className="p-3 rounded bg-[#FAFAF9] border border-[#E4E4E7] flex items-center justify-center gap-2.5 text-xs text-[#09090B]">
              <span className="w-3.5 h-3.5 border-2 border-[#18181B] border-t-transparent rounded-full animate-spin" />
              <span>Parsing clauses and statutory provisions...</span>
            </div>
          )}

          {/* Quick Benchmark Contract Option */}
          <div>
            <div className="text-[10px] uppercase font-semibold tracking-wider text-[#71717A] mb-2">
              Or load sample contract to explore:
            </div>

            <div className="space-y-1.5">
              {ALL_SAMPLE_CONTRACTS.map(sample => (
                <div
                  key={sample.id}
                  onClick={() => handleSampleSelect(sample)}
                  className="p-2.5 rounded border border-[#E4E4E7] hover:border-[#18181B] bg-[#FFFFFF] hover:bg-[#FAFAF9] transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-xs text-[#09090B] truncate">
                        {sample.name}
                      </div>
                      <div className="text-[10px] text-[#71717A] truncate">
                        {sample.description}
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-[#71717A] group-hover:text-[#09090B] shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-[#E4E4E7] bg-[#FAFAF9] flex items-center justify-between text-[11px] text-[#71717A]">
          <div className="flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5" />
            <span>ICA 1872 & TPA 1882 evaluation</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-medium text-[#71717A] hover:text-[#09090B]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
