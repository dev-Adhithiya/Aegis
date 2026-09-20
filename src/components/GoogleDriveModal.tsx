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
  onDocumentLoaded: (doc: StructuredDocument) => void;
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
}) => {
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchDriveFiles = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/drive/files');
        if (res.ok) {
          const files = await res.json();
          setDriveFiles(files);
        }
      } catch (err) {
        console.error('Error fetching drive files:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDriveFiles();
  }, [isOpen]);

  const handleImport = async (file: DriveFile) => {
    setImportingId(file.id);
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
        onDocumentLoaded(parsedDoc);
        onClose();
      }
    } catch (err) {
      console.error('Error importing file:', err);
    } finally {
      setImportingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090B]/40 backdrop-blur-xs p-4 font-sans select-none">
      <div className="w-full max-w-lg bg-[#FFFFFF] border border-[#E4E4E7] rounded-lg shadow-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#E4E4E7] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#FAFAF9] border border-[#E4E4E7] flex items-center justify-center text-[#18181B]">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#09090B]">
                Cloud Document Storage
              </h3>
              <p className="text-xs text-[#71717A]">
                Import contracts directly from storage vault
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#71717A] hover:text-[#09090B] p-1 rounded hover:bg-[#FAFAF9] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Files List */}
        <div className="p-4 max-h-80 overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="py-10 text-center text-xs text-[#71717A]">
              <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-[#18181B]" />
              <span>Checking storage folders...</span>
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
