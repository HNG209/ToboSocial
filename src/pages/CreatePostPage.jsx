"use client"

import { useState, useRef, useEffect } from "react"
import { useSelector } from "react-redux"
import { X, ImageIcon, FileImage } from 'lucide-react'

export default function CreatePostPage() {
  const [caption, setCaption] = useState("")
  const [mediaFiles, setMediaFiles] = useState([])
  const [userData, setUserData] = useState({
    id: "",
    name: "",
    avatar: ""
  })
  const [userId, setUserId] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  const error = useSelector((state) => state.posts.error)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userString = localStorage.getItem("user")
        if (userString) {
          const user = JSON.parse(userString)
          const userId = user._id
          if (userId) {
            setUserData({
              id: userId,
              name: user.fullName || user.username || "Người dùng",
              avatar: user.avatar || ""
            })
            try {
              const response = await fetch(`http://localhost:8081/v1/api/users/${userId}`)
              if (response.ok) {
                let apiUserData = await response.json()
                apiUserData = apiUserData.result
              setUserId(apiUserData._id)

                setUserData({
                  id: apiUserData._id,
                  name: apiUserData.fullName || apiUserData.username,
                  avatar: apiUserData.profile.avatar
                })
          
              }
            } catch (apiError) {
              console.error("Error fetching user data from API:", apiError)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    fetchUserData()
  }, [])

  const handleMediaChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setMediaFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeMedia = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (mediaFiles.length === 0) return alert("Vui lòng chọn ảnh hoặc video!")
  
    setIsSubmitting(true)
  
    const newPost = {
      _id: userId,
      caption,
      mediaFiles: mediaFiles.map(file => file.name)
    }
  
    const posts = JSON.parse(localStorage.getItem("posts")) || []
  
    posts.push(newPost)
  
    localStorage.setItem("posts", JSON.stringify(posts))
  
    alert("Bài viết đã được đăng thành công!")
  
    setIsSubmitting(false)
  
    setCaption("")
    setMediaFiles([])
  }
  

  const handleDragOver = (e) => e.preventDefault()
  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files)
      setMediaFiles((prev) => [...prev, ...newFiles])
    }
  }

  const getUserInitials = () => {
    if (!userData.name) return "U"
    return userData.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="max-w-lg mx-auto mt-8 bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="flex items-center justify-center p-4 border-b">
        <h1 className="text-xl font-bold text-center">Tạo bài viết</h1>
      </div>

      <div className="p-4 flex items-center gap-3 border-b">
        <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center overflow-hidden">
          {userData.avatar ? (
            <img src={userData.avatar} alt={userData.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-amber-800 font-bold">{getUserInitials()}</span>
          )}
        </div>
        <div>
          <p className="font-semibold">{userData.name || "Đang tải..."}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="px-4 py-3">
          <textarea
            className="w-full border rounded-lg px-3 py-2 resize-none text-base focus:ring-2 focus:ring-blue-400 transition hover:bg-gray-50"
            placeholder={`${userData.name ? userData.name.split(" ")[0] : "Bạn"} ơi, bạn đang nghĩ gì thế?`}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        {mediaFiles.length > 0 && (
          <div className="px-4 pb-4 grid grid-cols-2 gap-3">
            {mediaFiles.map((file, index) => (
              <div key={index} className="relative rounded-xl overflow-hidden border bg-gray-100 shadow">
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="absolute top-1 right-1 bg-gray-800/70 rounded-full p-1"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                {file.type.startsWith("image/") ? (
                  <img src={URL.createObjectURL(file)} alt={`Upload ${index}`} className="w-full h-32 object-cover" />
                ) : (
                  <video src={URL.createObjectURL(file)} className="w-full h-32 object-cover" controls />
                )}
              </div>
            ))}
          </div>
        )}

        {mediaFiles.length === 0 && (
          <div
            className="mx-4 mb-4 border rounded-xl p-8 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-gray-600" />
            </div>
            <p className="font-medium text-lg">Thêm ảnh/video</p>
            <p className="text-gray-500 text-sm">hoặc kéo và thả vào đây</p>
          </div>
        )}

        <div className="mx-4 mb-4 border rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileImage className="w-5 h-5" />
            </div>
            <span className="text-sm text-gray-700">Thêm từ thiết bị di động</span>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-sm font-medium text-blue-600"
          >
            Chọn file
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleMediaChange}
            multiple
            className="hidden"
          />
        </div>

        {error && (
          <div className="mx-4 mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {typeof error === "string" ? error : "Đã xảy ra lỗi khi tạo bài viết."}
          </div>
        )}

        <button
          type="submit"
          className="mx-4 mb-6 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={(!caption && mediaFiles.length === 0) || isSubmitting}
        >
          {isSubmitting ? "Đang đăng..." : "Đăng bài"}
        </button>
      </form>
    </div>
  )
}
