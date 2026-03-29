'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image as ImageIcon, X, UploadCloud, FileWarning } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ImageDropzoneProps {
  onImageUpload: (data: { base64: string; mimeType: string; fileName: string } | null) => void;
  className?: string;
}

export const ImageDropzone = ({ onImageUpload, className }: ImageDropzoneProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      toast.error('Image exceeds 4MB limit.');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      onImageUpload({
        base64: base64.split(',')[1],
        mimeType: file.type,
        fileName: file.name,
      });
    };
    reader.readAsDataURL(file);
  }, [onImageUpload]);

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setFileName(null);
    onImageUpload(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 min-h-[200px] flex items-center justify-center bg-white/5",
        isDragActive ? "border-white/40 bg-white/10" : "border-white/10 hover:border-white/20 hover:bg-white/[0.07]",
        preview && "border-none",
        className
      )}
    >
      <input {...getInputProps()} />

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full h-full group/preview"
          >
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover rounded-2xl min-h-[200px] max-h-[400px]"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <button
                onClick={removeImage}
                className="p-3 rounded-full bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/40 transition-colors shadow-xl"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {fileName && (
              <div className="absolute bottom-3 left-3 right-3 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-zinc-300 font-medium truncate">
                {fileName}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-4 p-8 text-center"
          >
            <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <UploadCloud className="h-8 w-8 text-zinc-500 group-hover:text-white transition-colors" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-white tracking-tight">
                {isDragActive ? "Drop visual context" : "Upload Visual Context"}
              </p>
              <p className="text-xs text-zinc-500 font-medium px-4">
                Drag & drop wireframes, flowcharts, or UI notes (PNG, JPG, WEBP • Max 4MB)
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
