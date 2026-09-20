import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  RefreshCw,
  FolderOpen,
  ArrowRight,
} from 'lucide-react';
import { StructuredDocument } from '../types/legal';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentLoaded?: (doc: StructuredDocument) => void;
  onImportDocument?: (doc: StructuredDocument) => void;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size: string;
  docType: 'lease' | 'nda';
  rawText: string;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  onDocumentLoaded,
  onImportDocument,
}) => {
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchDriveFiles = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/drive/files');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const files = await res.json();
        setDriveFiles(Array.isArray(files) ? files : []);
      } else {
        setErrorMessage('Unable to load documents from cloud storage at this moment.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network error encountered while fetching drive documents.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchDriveFiles();
  }, [isOpen]);

  const handleImport = async (file: DriveFile) => {
    setImportingId(file.id);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/documents/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: file.name,
          rawText: file.rawText,
          source: 'drive',
          driveInfo: {
            fileId: file.id,
            modifiedTime: file.modifiedTime,
          },
        }),
      });

      if (res.ok) {
        const parsedDoc: StructuredDocument = await res.json();
        const callback = onImportDocument || onDocumentLoaded;
        if (callback) {
          callback(parsedDoc);
        }
        onClose();
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMessage(errData.error || 'Failed to parse and import document.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error occurred while importing file.');
    } finally {
      setImportingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drive-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090B]/40 backdrop-blur-xs p-4 font-sans select-none"
    >
      <div className="w-full max-w-lg bg-[#FFFFFF] border border-[#E4E4E7] rounded-lg shadow-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#E4E4E7] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#FAFAF9] border border-[#E4E4E7] flex items-center justify-center text-[#18181B]">
              <FolderOpen className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h3 id="drive-modal-title" className="font-semibold text-sm text-[#09090B]">
                Cloud Document Storage
              </h3>
              <p className="text-xs text-[#71717A]">
                Import contracts directly from storage vault
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={fetchDriveFiles}
              disabled={isLoading}
              title="Refresh files"
              aria-label="Refresh cloud files list"
              className="text-[#71717A] hover:text-[#09090B] p-1.5 rounded hover:bg-[#FAFAF9] transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
            </button>
            <button
              onClick={onClose}
              aria-label="Close cloud storage dialog"
              className="text-[#71717A] hover:text-[#09090B] p-1.5 rounded hover:bg-[#FAFAF9] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B]"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-3 rounded bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B]">
            {errorMessage}
          </div>
        )}

        {/* Files List */}
        <div className="p-4 max-h-80 overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="py-10 text-center text-xs text-[#71717A]">
              <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-[#18181B]" />
              <span>Checking storage folders...</span>
            </div>
          ) : driveFiles.length === 0 && !errorMessage ? (
            <div className="py-8 text-center text-xs text-[#71717A]">
              No documents currently found in storage vault.
            </div>
          ) : (
            driveFiles.map(file => {
              const isImporting = importingId === file.id;

              return (
                <div
                  key={file.id}
                  className="p-3 rounded border border-[#E4E4E7] hover:border-[#A1A1AA] bg-[#FFFFFF] transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-[#71717A] shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-xs text-[#09090B] truncate">
                        {file.name}
                      </div>
                      <div className="text-[10px] text-[#71717A] font-mono mt-0.5">
                        {file.size} • {new Date(file.modifiedTime).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleImport(file)}
                    disabled={isImporting}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#18181B] hover:bg-[#09090B] disabled:opacity-50 text-[#FFFFFF] text-xs font-medium transition-colors shrink-0"
                  >
                    <span>{isImporting ? 'Parsing...' : 'Import'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#E4E4E7] bg-[#FAFAF9] flex items-center justify-end">
          <button
            onClick={onClose}
            className="text-xs font-medium text-[#71717A] hover:text-[#09090B] px-3 py-1"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
