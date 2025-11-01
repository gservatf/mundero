import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  getMetadata,
  updateMetadata,
  UploadTaskSnapshot,
  UploadTask,
  UploadResult,
} from "firebase/storage";
import { storage } from "../../../lib/firebase";

// Types for storage operations
export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  state: "running" | "paused" | "success" | "canceled" | "error";
}

export interface FileMetadata {
  name: string;
  size: number;
  contentType: string;
  customMetadata?: Record<string, string>;
  timeCreated: string;
  updated: string;
  downloadURL?: string;
}

export interface UploadOptions {
  metadata?: {
    contentType?: string;
    customMetadata?: Record<string, string>;
  };
  onProgress?: (progress: UploadProgress) => void;
  onError?: (error: Error) => void;
  onComplete?: (downloadURL: string) => void;
}

export const storageService = {
  /**
   * Upload a file to Firebase Storage
   */
  async uploadFile(
    file: File,
    path: string,
    options?: UploadOptions,
  ): Promise<string> {
    try {
      console.log("📤 Uploading file...", {
        fileName: file.name,
        size: file.size,
        path,
      });

      const storageRef = ref(storage, path);

      // Prepare metadata
      const metadata = {
        contentType: options?.metadata?.contentType || file.type,
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          ...options?.metadata?.customMetadata,
        },
      };

      let uploadTask: UploadTask;
      let snapshot: UploadTaskSnapshot;

      if (options?.onProgress) {
        // Use resumable upload for progress tracking
        uploadTask = uploadBytesResumable(storageRef, file, metadata);

        // Monitor upload progress
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress: UploadProgress = {
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              percentage:
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
              state: snapshot.state as UploadProgress["state"],
            };
            options.onProgress!(progress);
          },
          (error) => {
            console.error("❌ Upload error:", error);
            options.onError?.(error);
          },
          async () => {
            // Upload completed
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("✅ File uploaded successfully");
            options.onComplete?.(downloadURL);
          },
        );

        snapshot = await uploadTask;
      } else {
        // Simple upload without progress tracking
        const result: UploadResult = await uploadBytes(
          storageRef,
          file,
          metadata,
        );
        // Convert UploadResult to UploadTaskSnapshot-like object
        snapshot = {
          ref: result.ref,
          metadata: result.metadata,
          bytesTransferred: file.size,
          totalBytes: file.size,
          state: "success" as const,
          task: null as any, // Not available in simple upload
        };
      }

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log("✅ File uploaded successfully", { downloadURL });
      return downloadURL;
    } catch (error) {
      console.error("❌ Error uploading file:", error);
      throw new Error("Failed to upload file");
    }
  },

  /**
   * Get download URL for a file
   */
  async getFileUrl(path: string): Promise<string> {
    try {
      console.log("🔗 Getting file URL...", { path });

      const storageRef = ref(storage, path);
      const downloadURL = await getDownloadURL(storageRef);

      console.log("✅ File URL retrieved successfully");
      return downloadURL;
    } catch (error) {
      console.error("❌ Error getting file URL:", error);
      throw new Error("Failed to get file URL");
    }
  },

  /**
   * Delete a file from Firebase Storage
   */
  async deleteFile(path: string): Promise<void> {
    try {
      console.log("🗑️ Deleting file...", { path });

      const storageRef = ref(storage, path);
      await deleteObject(storageRef);

      console.log("✅ File deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting file:", error);
      throw new Error("Failed to delete file");
    }
  },

  /**
   * Get file metadata
   */
  async getFileMetadata(path: string): Promise<FileMetadata> {
    try {
      console.log("📋 Getting file metadata...", { path });

      const storageRef = ref(storage, path);
      const metadata = await getMetadata(storageRef);

      const fileMetadata: FileMetadata = {
        name: metadata.name,
        size: metadata.size,
        contentType: metadata.contentType || "application/octet-stream",
        customMetadata: metadata.customMetadata,
        timeCreated: metadata.timeCreated,
        updated: metadata.updated,
      };

      // Optionally get download URL
      try {
        fileMetadata.downloadURL = await getDownloadURL(storageRef);
      } catch (urlError) {
        console.warn("Could not get download URL:", urlError);
      }

      console.log("✅ File metadata retrieved successfully");
      return fileMetadata;
    } catch (error) {
      console.error("❌ Error getting file metadata:", error);
      throw new Error("Failed to get file metadata");
    }
  },

  /**
   * Update file metadata
   */
  async updateFileMetadata(
    path: string,
    metadata: {
      contentType?: string;
      customMetadata?: Record<string, string>;
    },
  ): Promise<void> {
    try {
      console.log("📝 Updating file metadata...", { path, metadata });

      const storageRef = ref(storage, path);
      await updateMetadata(storageRef, metadata);

      console.log("✅ File metadata updated successfully");
    } catch (error) {
      console.error("❌ Error updating file metadata:", error);
      throw new Error("Failed to update file metadata");
    }
  },

  /**
   * Upload profile picture with automatic resizing path
   */
  async uploadProfilePicture(
    file: File,
    uid: string,
    options?: UploadOptions,
  ): Promise<string> {
    const path = `profile_pictures/${uid}/${Date.now()}_${file.name}`;
    return this.uploadFile(file, path, {
      ...options,
      metadata: {
        contentType: file.type,
        customMetadata: {
          userId: uid,
          type: "profile_picture",
          ...options?.metadata?.customMetadata,
        },
      },
    });
  },

  /**
   * Upload document with organized path structure
   */
  async uploadDocument(
    file: File,
    uid: string,
    documentType: string,
    options?: UploadOptions,
  ): Promise<string> {
    const path = `documents/${uid}/${documentType}/${Date.now()}_${file.name}`;
    return this.uploadFile(file, path, {
      ...options,
      metadata: {
        contentType: file.type,
        customMetadata: {
          userId: uid,
          documentType,
          ...options?.metadata?.customMetadata,
        },
      },
    });
  },

  /**
   * Upload media for feed posts
   */
  async uploadFeedMedia(
    file: File,
    uid: string,
    postId: string,
    options?: UploadOptions,
  ): Promise<string> {
    const path = `feed_media/${uid}/${postId}/${Date.now()}_${file.name}`;
    return this.uploadFile(file, path, {
      ...options,
      metadata: {
        contentType: file.type,
        customMetadata: {
          userId: uid,
          postId,
          type: "feed_media",
          ...options?.metadata?.customMetadata,
        },
      },
    });
  },

  /**
   * Validate file type and size
   */
  validateFile(
    file: File,
    options: {
      maxSize?: number; // in bytes
      allowedTypes?: string[];
    } = {},
  ): { isValid: boolean; error?: string } {
    const { maxSize = 10 * 1024 * 1024, allowedTypes } = options; // Default 10MB

    // Check file size
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum allowed size (${Math.round(maxSize / 1024 / 1024)}MB)`,
      };
    }

    // Check file type
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
      };
    }

    return { isValid: true };
  },

  /**
   * Generate unique file path
   */
  generateFilePath(
    category: string,
    uid: string,
    fileName: string,
    subCategory?: string,
  ): string {
    const timestamp = Date.now();
    const basePath = `${category}/${uid}`;
    const fullPath = subCategory
      ? `${basePath}/${subCategory}/${timestamp}_${fileName}`
      : `${basePath}/${timestamp}_${fileName}`;

    return fullPath;
  },
};
