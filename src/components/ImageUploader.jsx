import React, { useState } from 'react';

function ImageUploader() {
  const [imageUrl, setImageUrl] = useState('');

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'tobo_unsigned_preset'); // Thay bằng preset bạn tạo

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dwaldcj4v/image/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setImageUrl(data.secure_url); // Đây là URL ảnh bạn cần
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} />
      {imageUrl && (
        <div>
          <p>Ảnh đã upload:</p>
          <img src={imageUrl} alt="Uploaded" width="300" />
          <p>URL: {imageUrl}</p>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
