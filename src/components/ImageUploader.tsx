"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadedImage {
  url: string;
  type: "antes" | "durante" | "despues";
  caption: string;
  file: File;
}

interface ImageUploaderProps {
  onUpload: (files: { url: string; type: string }[]) => void;
  type?: "antes" | "durante" | "despues";
}

const typeConfig = {
  antes: { label: "Antes", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  durante: { label: "Durante", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  despues: { label: "Después", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
};

export default function ImageUploader({ onUpload, type = "antes" }: ImageUploaderProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedType, setSelectedType] = useState<"antes" | "durante" | "despues">(type);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList) => {
      const newImages: UploadedImage[] = Array.from(files)
        .filter((f) => f.type.startsWith("image/"))
        .map((file) => ({
          url: URL.createObjectURL(file),
          type: selectedType,
          caption: "",
          file,
        }));
      setImages((prev) => [...prev, ...newImages]);
    },
    [selectedType]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleBrowse = () => fileInputRef.current?.click();

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateCaption = (index: number, caption: string) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, caption } : img))
    );
  };

  const handleConfirm = () => {
    onUpload(images.map((img) => ({ url: img.url, type: img.type })));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <ImageIcon className="w-4 h-4 text-primary-500" />
        <span className="text-sm font-semibold text-text-primary">
          Evidencia Fotográfica
        </span>
        {images.length > 0 && (
          <span className="text-xs text-text-tertiary ml-auto">
            {images.length} imagen{images.length !== 1 && "es"}
          </span>
        )}
      </div>

      {/* Type selector */}
      <div className="flex gap-2">
        {(Object.keys(typeConfig) as Array<"antes" | "durante" | "despues">).map(
          (key) => (
            <button
              key={key}
              onClick={() => setSelectedType(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === key
                  ? typeConfig[key].color + " ring-2 ring-offset-1 ring-current/20"
                  : "bg-surface-tertiary text-text-tertiary hover:text-text-secondary"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${typeConfig[key].dot}`}
              />
              {typeConfig[key].label}
            </button>
          )
        )}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowse}
        className={`card-static cursor-pointer transition-all p-8 text-center border-2 border-dashed ${
          isDragging
            ? "border-primary-400 bg-primary-50"
            : "border-border hover:border-primary-300 hover:bg-surface-secondary"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <Upload
          className={`w-8 h-8 mx-auto mb-3 ${
            isDragging ? "text-primary-500" : "text-text-tertiary"
          }`}
        />
        <p className="text-sm font-medium text-text-secondary">
          Arrastra imágenes aquí o haz clic para seleccionar
        </p>
        <p className="text-xs text-text-tertiary mt-1">
          JPG, PNG, WEBP — hasta 10MB
        </p>
      </div>

      {/* Thumbnails */}
      <AnimatePresence mode="popLayout">
        {images.map((img, i) => (
          <motion.div
            key={img.url}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="card-static p-3"
          >
            <div className="flex gap-3">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-surface-tertiary flex-shrink-0">
                <img
                  src={img.url}
                  alt={`Evidencia ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(i);
                  }}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-danger text-white flex items-center justify-center hover:bg-red-700 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`chip text-[10px] ${
                      typeConfig[img.type].color
                    }`}
                  >
                    {typeConfig[img.type].label}
                  </span>
                  <span className="text-[10px] text-text-tertiary truncate">
                    {img.file.name}
                  </span>
                </div>
                <input
                  type="text"
                  className="input-field text-xs py-1.5"
                  placeholder="Caption (opcional)"
                  value={img.caption}
                  onChange={(e) => updateCaption(i, e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {images.length > 0 && (
        <div className="flex justify-end gap-2 pt-2">
          <button className="btn-secondary" onClick={() => setImages([])}>
            Limpiar Todo
          </button>
          <button className="btn-primary" onClick={handleConfirm}>
            <FileText className="w-4 h-4" />
            Confirmar ({images.length})
          </button>
        </div>
      )}
    </div>
  );
}
