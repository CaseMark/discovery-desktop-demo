"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getDocumentsByCase,
  createDocument,
  deleteDocument as dbDeleteDocument,
  updateDocument,
  getProcessingJobsByDocument,
} from "@/lib/storage/discovery-db";
import { processDocument } from "@/lib/processing/document-pipeline";
import type { Document, ProcessingJob, UploadProgress } from "@/types/discovery";

// Local user ID for IndexedDB isolation
const LOCAL_USER_ID = "local-user";

// Statuses that indicate a document is still being processed
const PROCESSING_STATUSES = new Set(["pending", "ocr", "chunking", "embedding"]);

interface UseDocumentsResult {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  uploadProgress: Map<string, UploadProgress>;
  uploadFiles: (files: File[]) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  refresh: () => Promise<Document[]>;
}

export function useDocuments(caseId: string): UseDocumentsResult {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Map<string, UploadProgress>>(new Map());

  // Track active processing document IDs to avoid duplicate processing
  const activeProcessingRef = useRef<Set<string>>(new Set());

  // Load documents for case
  const loadDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const docs = await getDocumentsByCase(caseId);
      setDocuments(docs);
      return docs;
    } catch (err) {
      console.error("Failed to load documents:", err);
      setError("Failed to load documents");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  // Initial load
  useEffect(() => {
    if (caseId) {
      loadDocuments();
    }
  }, [caseId, loadDocuments]);

  // Poll for status updates when there are documents with processing status
  useEffect(() => {
    // Check if any documents are in processing state (from DB, not from uploadProgress)
    const processingDocs = documents.filter(
      (doc) => PROCESSING_STATUSES.has(doc.status) && !activeProcessingRef.current.has(doc.id)
    );

    if (processingDocs.length === 0) return;

    // Poll every 2 seconds to check if processing completed
    const pollInterval = setInterval(async () => {
      const freshDocs = await getDocumentsByCase(caseId);
      const stillProcessing = freshDocs.some(
        (doc) => PROCESSING_STATUSES.has(doc.status) && !activeProcessingRef.current.has(doc.id)
      );

      // Update documents state with fresh data
      setDocuments(freshDocs);

      // If no more processing docs (from DB), stop polling
      if (!stillProcessing) {
        clearInterval(pollInterval);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [documents, caseId]);

  // Upload files
  const uploadFiles = useCallback(async (files: File[]) => {
    for (const file of files) {
      // Create document record
      const doc = await createDocument({
        caseId,
        uploadedBy: LOCAL_USER_ID,
        status: "pending",
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      // Track this document as actively processing
      activeProcessingRef.current.add(doc.id);

      // Initialize progress tracking - document shows in "Processing" section
      // until complete, then moves to "Documents" section via loadDocuments()
      setUploadProgress((prev) => {
        const next = new Map(prev);
        next.set(doc.id, {
          documentId: doc.id,
          fileName: file.name,
          stage: "pending",
          progress: 0,
        });
        return next;
      });

      // Start processing pipeline
      try {
        await processDocument(doc.id, file, (progress) => {
          setUploadProgress((prev) => {
            const next = new Map(prev);
            next.set(doc.id, progress);
            return next;
          });
        });

        // Refresh documents from DB BEFORE removing from progress tracking
        // This ensures the document has correct status when it transitions
        // from the "Processing" section to the "Documents" section
        await loadDocuments();

        // Now remove from progress tracking - document will show in Documents list
        activeProcessingRef.current.delete(doc.id);
        setUploadProgress((prev) => {
          const next = new Map(prev);
          next.delete(doc.id);
          return next;
        });
      } catch (err) {
        console.error("Processing failed:", err);
        activeProcessingRef.current.delete(doc.id);
        setUploadProgress((prev) => {
          const next = new Map(prev);
          next.set(doc.id, {
            documentId: doc.id,
            fileName: file.name,
            stage: "error",
            progress: 0,
            error: err instanceof Error ? err.message : "Processing failed",
          });
          return next;
        });
      }
    }
  }, [caseId, loadDocuments]);

  // Delete document
  const deleteDocument = useCallback(async (documentId: string) => {
    await dbDeleteDocument(documentId);
    setDocuments((prev) => prev.filter((d) => d.id !== documentId));
    setUploadProgress((prev) => {
      const next = new Map(prev);
      next.delete(documentId);
      return next;
    });
  }, []);

  return {
    documents,
    isLoading,
    error,
    uploadProgress,
    uploadFiles,
    deleteDocument,
    refresh: loadDocuments,
  };
}
