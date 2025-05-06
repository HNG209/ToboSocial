import React, { useState } from 'react';
import { Modal, Button } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons'; // Import the Plus icon
import { usePreviewImage, useSetFileInput, useSetPreviewImage, useSetUploadedImage, useUploadedImage } from './context/UploadedImageContext';

function ImageUploader() {
  // const [imageUrl, setImageUrl] = useState('');
  // const [previewUrl, setPreviewUrl] = useState(''); // For previewing the image

  const setImageUrl = useSetUploadedImage(); // Use the context to set the image URL
  const getPreviewUrl = usePreviewImage(); // Use the context to get the preview URL
  const setPreviewUrl = useSetPreviewImage(); // Use the context to set the preview URL
  const setFileInput = useSetFileInput(); // Use the context to set the file input element
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFileInput(file); // Set the file input element in context

    if (file) {
      const preview = URL.createObjectURL(file); // Create a preview URL for the image
      setPreviewUrl(preview);
      setIsModalOpen(true); // Open the modal to show the preview
    }
    event.target.value = ''; // Reset the file input value
  };

  // const handleUpload = async () => {
  //   const fileInput = document.getElementById('file-upload');
  //   const file = fileInput.files[0];
  //   const formData = new FormData();
  //   formData.append('file', file);
  //   formData.append('upload_preset', 'tobo_unsigned_preset'); // Replace with your preset

  //   try {
  //     const res = await fetch('https://api.cloudinary.com/v1_1/dwaldcj4v/image/upload', {
  //       method: 'POST',
  //       body: formData,
  //     });
  //     const data = await res.json();
  //     setImageUrl(data.secure_url); // Set the uploaded image URL
  //     console.log('Uploaded Image URL:', data.secure_url);
  //   } catch (err) {
  //     console.error('Upload error:', err);
  //   } finally {
  //     setIsModalOpen(false); // Close the modal after upload
  //   }
  // };

  const handleCancel = () => {
    setIsModalOpen(false);
    setPreviewUrl(''); // Clear the preview URL
  };

  return (
    <div className="flex flex-col items-center">
      <label
        htmlFor="file-upload"
        className="cursor-pointer flex items-center bg-gray-400 mt-2 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-200"
      >
        <UploadOutlined className='mr-2 text-lg' />
        <span className="text-sm">Upload Avatar</span> {/* Make the text smaller */}
      </label>
      <input
        id="file-upload"
        type="file"
        onChange={handleFileChange}
        className="hidden" // Hides the default file input
      />

      {/* Ant Design Modal for Image Preview */}
      <Modal
        title="Avatar Preview"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="confirm" type="primary" onClick={() => setIsModalOpen(false)}>
            Confirm
          </Button>,
        ]}
      >
        {getPreviewUrl() && (
          <img
            src={getPreviewUrl()}
            alt="Preview"
            className="w-full h-auto rounded-md"
          />
        )}
      </Modal>

      {/* Display the uploaded image */}
      {/* {imageUrl && (
        <div className="mt-4">
          <p>Uploaded Image:</p>
          <img
            src={imageUrl}
            alt="Uploaded"
            width="300"
            className="rounded-md shadow-md"
          />
          <p className="text-sm text-gray-500 mt-2">URL: {imageUrl}</p>
        </div>
      )} */}
    </div>
  );
}

export default ImageUploader;
