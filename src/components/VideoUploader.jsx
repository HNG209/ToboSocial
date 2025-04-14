import React, { useState } from 'react';

export default function VideoUploader() {
    const [videoUrl, setVideoUrl] = useState('');
  
    const handleUpload = async (e) => {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'tobo_unsigned_preset');
  
      const res = await fetch('https://api.cloudinary.com/v1_1/dwaldcj4v/video/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setVideoUrl(data.secure_url);
    };
  
    return (
      <div>
        <input type="file" accept="video/*" onChange={handleUpload} />
        {videoUrl && (
          <>
            <video width="600" controls>
              <source src={videoUrl} type="video/mp4" />
              Trình duyệt của bạn không hỗ trợ video.
            </video>
            <br />
            <a href={videoUrl} download>
              <button>Tải video</button>
            </a>
          </>
        )}
      </div>
    );
  }
  