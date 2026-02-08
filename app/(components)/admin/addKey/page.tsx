"use client";

import { useState, FormEvent } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";

// Define the structure for our form data and validation errors
interface FormData {
  name: string;
  apiKey: string;
}

interface FormErrors {
  name?: string;
  apiKey?: string;
}

const AddKeysPage = () => {
  // Get the authentication token from the Zustand store
  const authToken = useAuthStore((state) => state.token);

  // State for form inputs
  const [formData, setFormData] = useState<FormData>({
    name: "",
    apiKey: "",
  });

  // State for validation errors
  const [errors, setErrors] = useState<FormErrors>({});

  // State to handle loading during API call
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Validates the form data.
   * @returns An object containing error messages for invalid fields.
   */
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    }
    if (!formData.apiKey.trim()) {
      newErrors.apiKey = "API Key is required.";
    }
    return newErrors;
  };

  /**
   * Handles the form submission.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Validate the form and get any errors
    const validationErrors = validateForm();
    setErrors(validationErrors);

    // If there are no validation errors, proceed with API call
    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);

      if (!authToken) {
        toast.error("Authentication error: You are not logged in.");
        setIsLoading(false);
        return;
      }
      const toastId = toast.loading("Adding API Key...");

      try {
        // The payload to be sent to the API
        const payload: FormData = {
          name: formData.name,
          apiKey: formData.apiKey,
        };

        // Make the POST request to the API endpoint
        await axios.post("/api/keys", payload, {
          headers: {
            // 3. Add the Authorization header to the request
            Authorization: `Bearer ${authToken}`,
          },
        });
        
        toast.success("API Key added successfully!", { id: toastId });

        // Reset form fields after successful submission
        setFormData({ name: "", apiKey: "" });

      } catch (error) {
        // Handle potential API errors
        let errorMessage = "An unexpected error occurred.";
        if (axios.isAxiosError(error)) {
            // You can customize this based on the error response from your API
            errorMessage = error.response?.data?.message || "Failed to add API Key.";
        }
        toast.error(errorMessage, { id: toastId });
        console.error("API Error:", error);

      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg dark:bg-slate-800">
        <h1 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-100">
          Add New API Key
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`mt-2 block w-full px-3 py-2 border rounded-md shadow-sm transition-colors
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm
                dark:bg-slate-700 dark:text-slate-50 dark:placeholder-slate-400
                ${ errors.name ? "border-red-500 focus:ring-red-500" : "border-slate-300 dark:border-slate-600" }`}
              placeholder="e.g., My Awesome App"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="apiKey"
              className="block text-sm font-medium text-gray-700"
            >
              API Key
            </label>
            <input
              id="apiKey"
              type="text"
              value={formData.apiKey}
              onChange={(e) =>
                setFormData({ ...formData, apiKey: e.target.value })
              }
              className={`mt-2 block w-full px-3 py-2 border rounded-md shadow-sm transition-colors
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm
                dark:bg-slate-700 dark:text-slate-50 dark:placeholder-slate-400
                ${ errors.apiKey ? "border-red-500 focus:ring-red-500" : "border-slate-300 dark:border-slate-600" }`}
              placeholder="Enter the API key"
            />
            {errors.apiKey && (
              <p className="mt-1 text-xs text-red-600">{errors.apiKey}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Adding..." : "Add Key"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default AddKeysPage;
