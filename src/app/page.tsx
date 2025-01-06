"use client";
import React, { useState, ChangeEvent } from "react";
import { Upload, ImageIcon, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";

const GroceryOrganizer = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [groceryList, setGroceryList] = useState<string[]>([]);

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

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }

    setLoading(true);
    setError("");
    setGroceryList([]);

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

      // Extract and parse the grocery list
      const groceryListMatch = data.result.match(
        /"grocery_list":\s*(\[[^\]]*\])/
      );
      if (groceryListMatch) {
        const parsedList = JSON.parse(groceryListMatch[1]);
        setGroceryList(parsedList);
      } else {
        throw new Error("Failed to extract grocery list from response");
      }
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
    <div className="min-h-screen bg-black">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-white">
            Smart Grocery List Organizer
          </h1>
          <p className="text-gray-400">
            Upload a picture of your grocery list, and I'll organize items from
            most fragile to least fragile
          </p>
        </div>

        {/* Upload Section */}
        <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center space-y-4 bg-gray-900/50 backdrop-blur-sm hover:border-gray-600 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center space-y-3"
          >
            <div className="p-4 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors group">
              <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-gray-300" />
            </div>
            <span className="text-sm text-gray-400 group-hover:text-gray-300">
              Click to upload your grocery list image
            </span>
          </label>

          {preview && (
            <div className="mt-4">
              <Image
                src={preview}
                alt="Preview"
                width={300}
                height={300}
                className="max-h-64 w-auto mx-auto rounded-lg border border-gray-700 object-contain"
                priority
              />
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleSubmit}
          disabled={!selectedFile || loading}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-200"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Organizing your list...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Organize List</span>
            </>
          )}
        </button>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="bg-red-900/50 border-red-800">
            <AlertDescription className="text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Results Section */}
        {groceryList.length > 0 && (
          <div className="border border-gray-800 rounded-xl p-6 bg-gray-900/50 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Your Organized Grocery List
            </h2>
            <ul className="list-disc list-inside text-gray-300">
              {groceryList.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroceryOrganizer;
