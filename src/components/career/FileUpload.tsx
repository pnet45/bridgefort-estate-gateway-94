
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X } from 'lucide-react';

interface FileUploadProps {
  label: string;
  onFileSelect: (file: File | null) => void;
  file: File | null;
  acceptedTypes?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  onFileSelect,
  file,
  acceptedTypes = '.pdf,.doc,.docx'
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };
  
  const handleRemoveFile = () => {
    onFileSelect(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };
  
  return (
    <div className="space-y-2">
      <Label htmlFor="resume">{label}</Label>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        {!file ? (
          <>
            <input
              ref={inputRef}
              type="file"
              id="resume"
              accept={acceptedTypes}
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="space-y-2">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                <Upload className="h-6 w-6 text-gray-600" />
              </div>
              <div className="text-sm text-gray-600">
                <label
                  htmlFor="resume"
                  className="cursor-pointer text-estate-blue hover:text-estate-darkBlue font-medium"
                >
                  Click to upload
                </label>{' '}
                or drag and drop
              </div>
              <p className="text-xs text-gray-500">{acceptedTypes.replace(/\./g, '').toUpperCase()} up to 10MB</p>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-estate-blue bg-opacity-10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-estate-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="text-gray-500 hover:text-red-500"
            >
              <X size={18} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
