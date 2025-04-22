import React, { useState } from 'react';
import axios from 'axios';
import { Input, SelectPicker, Button, Uploader } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';

const fileTypes = [
  { label: 'Image', value: 'image' },
  { label: 'Word Document', value: 'word' },
  { label: 'PDF', value: 'pdf' },
  { label: 'Excel', value: 'excel' },
];

const Uploadfiles = () => {
  const [name, setName] = useState('');
  const [fileType, setFileType] = useState('');
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleUpload = async () => {
    const newErrors = {};

    // Field validations
    if (!name.trim()) newErrors.name = 'Name is required.';
    if (!fileType) newErrors.fileType = 'File type is required.';
    if (!file) newErrors.file = 'File upload is required.';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // All validations passed, proceed with API call
      const formData = new FormData();
      formData.append('name', name);
      formData.append('fileType', fileType);
      formData.append('file', file);

      try {
        setLoading(true);
        setSuccess('');
        setErrorMessage('');
        
        const response = await axios.post('http://localhost:5000/api/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log(response.data)

        // Handle success
        if (response.status === 201) {
          setSuccess('File uploaded successfully!');
          setName('');
          setFileType('');
          setFile(null);
        }
      } catch (err) {
        // Handle error
        setErrorMessage('Error uploading file. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-2xl shadow-md space-y-4">
      <h2 className="text-2xl font-semibold text-center">Document Upload</h2>

      {/* Name Input */}
      <div>
        <Input
          placeholder="Enter name"
          value={name}
          onChange={setName}
          className="w-full"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* File Type Selection */}
      <div>
        <SelectPicker
          data={fileTypes}
          searchable={false}
          placeholder="Select File Type"
          value={fileType}
          onChange={setFileType}
          className="w-full"
        />
        {errors.fileType && <p className="text-red-500 text-sm mt-1">{errors.fileType}</p>}
      </div>

      {/* File Upload Area */}
      <div>
        <Uploader
          autoUpload={false}
          fileListVisible={false}
          onChange={(files) => setFile(files[0]?.blobFile || null)}
          className="w-full"
        >
          <button className="bg-gray-100 hover:bg-gray-200 border border-dashed border-gray-400 p-3 w-full text-center rounded-lg">
            {file ? file.name : 'Click or drag file to this area to upload'}
          </button>
        </Uploader>
        {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}
      </div>

      {/* Success/Error Messages */}
      {success && <p className="text-green-500 text-sm mt-2">{success}</p>}
      {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}

      {/* Upload Button */}
      <Button
        appearance="primary"
        block
        onClick={handleUpload}
        loading={loading}
        disabled={loading}
      >
        {loading ? 'Uploading...' : 'Upload'}
      </Button>
    </div>
  );
};

export default Uploadfiles;
