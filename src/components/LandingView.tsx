import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  ArrowRight,
  Plus,
  Scale,
  Sparkles,
} from 'lucide-react';
import { StructuredDocument } from '../types/legal';
import { AegisLogo } from './AegisLogo';

interface LandingViewProps {
  documents: StructuredDocument[];
  onSelectDocument: (docId: string) => void;
  onOpenUpload: () => void;
  onOpenDrive: () => void;
  onOpenCompare: () => void;
  onQuickAsk: (question: string) => void;
  onDocumentLoaded?: (doc: StructuredDocument) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  documents,
  onSelectDocument,
  onOpenUpload,
  onOpenCompare,
  onDocumentLoaded,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [landingError, setLandingError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleProcessFile = async (file: File) => {
    setLandingError(null);
    try {
      const text = await file.text();
      const res = await fetch('/api/documents/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: file.name,
          rawText: text,
          source: 'upload',
        }),
      });

      if (res.ok) {
        const doc: StructuredDocument = await res.json();
        if (onDocumentLoaded) {
          onDocumentLoaded(doc);
        } else {
          onSelectDocument(doc.id);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setLandingError(errData.error || 'Failed to process contract.');
      }
    } catch (err: any) {
      console.error('Error processing uploaded file:', err);
      setLandingError(err?.message || 'Error uploading document.');
    }
  };

  const handleLoadSample = async () => {
    setIsLoadingSample(true);
    setLandingError(null);
    try {
      const res = await fetch('/api/documents/load-sample/sample-lease-1', {
        method: 'POST',
      });
      if (res.ok) {
        const doc = await res.json();
        if (onDocumentLoaded) {
          onDocumentLoaded(doc);
        } else {
          onSelectDocument(doc.id);
        }
      } else {
        setLandingError('Unable to load sample lease.');
      }
    } catch (err: any) {
      console.error('Error loading sample agreement:', err);
      setLandingError(err?.message || 'Connection error while loading sample.');
    } finally {
      setIsLoadingSample(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAFAF9] flex flex-col items-center justify-start px-6 py-12 lg:py-16 font-sans select-none">
      <div className="w-full max-w-2xl flex flex-col items-center">
        {/* Brand Header with Uploaded AEGIS Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4">
            <AegisLogo size={48} showText={true} theme="dark" />
          </div>

          <p className="text-xs text-[#71717A] mt-2 max-w-md font-normal leading-relaxed">
            Autonomous legal document parsing, cited clause analysis, and oral negotiation practice under Indian contract law.
          </p>
        </div>

        {/* User-facing error message */}
        {landingError && (
          <div
            role="alert"
            className="w-full mb-4 p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] flex items-center justify-between"
          >
            <span>{landingError}</span>
            <button
              type="button"
              onClick={() => setLandingError(null)}
              aria-label="Dismiss alert"
              className="text-[#991B1B] hover:text-[#7F1D1D] font-bold ml-2 px-1 focus-visible:outline-none"
            >
              ×
            </button>
          </div>
        )}

        {/* Minimalist File Upload Zone */}
        <div
          tabIndex={0}
          role="button"
          aria-label="Click or drop a file to parse contract"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full p-8 sm:p-12 rounded-lg border text-center cursor-pointer transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B] ${
            isDragging
              ? 'bg-[#F4F4F5] border-[#18181B]'
              : 'bg-[#FFFFFF] border-[#E4E4E7] hover:border-[#A1A1AA]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="w-10 h-10 rounded bg-[#FAFAF9] border border-[#E4E4E7] flex items-center justify-center mx-auto mb-3 text-[#18181B]">
            <Upload className="w-5 h-5" />
          </div>

          <div className="text-sm font-semibold text-[#09090B]">
            Drop your contract here, or click to browse
          </div>

          <p className="text-xs text-[#71717A] mt-1">
            Supports PDF, DOCX, and TXT (Indian Lease Agreements, NDAs, Service Contracts)
          </p>
        </div>

        {/* Minimalist Actions / Sample Contract Trigger */}
        <div className="flex items-center gap-4 mt-4 text-xs text-[#71717A]">
          <button
            onClick={onOpenUpload}
            className="hover:text-[#09090B] transition-colors flex items-center gap-1 font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Paste contract text</span>
          </button>

          <span>•</span>

          <button
            onClick={handleLoadSample}
            disabled={isLoadingSample}
            className="hover:text-[#09090B] transition-colors underline underline-offset-4 decoration-[#E4E4E7] hover:decoration-[#18181B]"
          >
            {isLoadingSample ? 'Loading agreement...' : 'Load sample Bengaluru lease'}
          </button>
        </div>

        {/* Active Documents List (Only if documents exist) */}
        {documents.length > 0 && (
          <div className="w-full mt-10">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">
                Imported Documents ({documents.length})
              </h2>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E4E4E7] rounded-lg divide-y divide-[#E4E4E7] overflow-hidden">
              {documents.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => onSelectDocument(doc.id)}
                  className="p-3.5 hover:bg-[#FAFAF9] transition-colors cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-[#18181B] shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-[#09090B]">
                        {doc.name}
                      </div>
                      <div className="text-[10px] text-[#71717A]">
                        {doc.clauses.length} clauses analyzed • {doc.jurisdiction || 'Indian Law'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#FAFAF9] border border-[#E4E4E7] text-[#18181B]">
                      {doc.riskFlags.length} flags
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#71717A]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Non-legal statutory notice */}
        <div className="mt-12 text-center text-[11px] text-[#A1A1AA] max-w-md border-t border-[#E4E4E7] pt-4">
          Non-legal advisory assistant. Statutory references (Transfer of Property Act 1882 & Indian Contract Act 1872) are provided for discussion preparation with certified legal counsel.
        </div>
      </div>
    </div>
  );
};
