"use client";

import { useState } from "react";
import ImageUpload from "./ImageUpload";

interface ImageItem {
  url: string;
  order: number;
}

interface MultiImageUploadProps {
  value: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  label?: string;
  maxImages?: number;
}

export default function MultiImageUpload({
  value,
  onChange,
  label,
  maxImages = 10,
}: MultiImageUploadProps) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const handleImageUpload = async (url: string, index: number) => {
    const newImages = [...value];
    if (newImages[index]) {
      newImages[index].url = url;
    } else {
      newImages.push({ url, order: index });
    }
    onChange(newImages);
  };

  const handleRemove = (index: number) => {
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages.map((img, i) => ({ ...img, order: i })));
  };

  const handleOrderChange = (index: number, newOrder: number) => {
    const newImages = [...value];
    const item = newImages[index];
    newImages.splice(index, 1);
    newImages.splice(newOrder, 0, item);
    onChange(newImages.map((img, i) => ({ ...img, order: i })));
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} (Maksimum {maxImages} resim)
        </label>
      )}
      <div className="space-y-4">
        {value.map((image, index) => (
          <div
            key={index}
            className="flex items-start space-x-4 p-4 border border-gray-300 rounded-lg"
          >
            <div className="flex-1">
              <ImageUpload
                value={image.url}
                onChange={(url) => handleImageUpload(url, index)}
                label={`Resim ${index + 1}`}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm text-gray-700">Sıra:</label>
              <input
                type="number"
                value={image.order}
                onChange={(e) =>
                  handleOrderChange(index, parseInt(e.target.value) || 0)
                }
                className="w-20 px-2 py-1 border border-gray-300 rounded"
                min="0"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
              >
                Kaldır
              </button>
            </div>
          </div>
        ))}
        {value.length < maxImages && (
          <button
            type="button"
            onClick={() => {
              onChange([...value, { url: "", order: value.length }]);
            }}
            className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-500"
          >
            + Resim Ekle
          </button>
        )}
      </div>
    </div>
  );
}



