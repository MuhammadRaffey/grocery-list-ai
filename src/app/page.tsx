"use client";
import React, { useState, ChangeEvent } from "react";
import { Upload, ImageIcon, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";

const GroceryOrganizer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(""); // For image preview
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>(""); // For error messages
  const [apiResponse, setApiResponse] = useState<string>(""); // For the API response

  // Handle file selection and preview generation
  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setError("");

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setError("Please select a valid image file");
      setSelectedFile(null);
      setPreview("");
    }
  };

  // Handle form submission to the API
  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }

    setLoading(true);
    setError("");
    setApiResponse("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/grocery", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process the image");
      }

      setApiResponse(data.result); // Set the response from the API
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred while processing your request");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 bg-gray-900 min-h-screen">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">
          Smart Grocery List Organizer
        </h1>
        <p className="text-gray-400">
          Upload a picture of your grocery list and we will extract and organize
          it.
        </p>
      </div>

      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center space-y-4 bg-gray-800">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center space-y-2"
        >
          <div className="p-4 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors">
            <ImageIcon className="w-8 h-8 text-gray-300" />
          </div>
          <span className="text-sm text-gray-300">
            Click to upload an image
          </span>
        </label>

        {preview && (
          <div className="mt-4">
            <Image
              src={preview}
              alt="Preview"
              className="max-h-48 mx-auto rounded-lg border border-gray-700"
              width={200}
              height={200}
            />
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={handleSubmit}
        disabled={!selectedFile || loading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            <span>Analyze Image</span>
          </>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="bg-red-900 border-red-700">
          <AlertDescription className="text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Section */}
      {apiResponse && (
        <div className="border border-gray-700 rounded-lg p-6 bg-gray-800">
          <h2 className="text-lg font-semibold mb-4 text-white">Results</h2>
          <p className="text-gray-200 whitespace-pre-wrap">{apiResponse}</p>
        </div>
      )}
    </div>
  );
};

export default GroceryOrganizer;
