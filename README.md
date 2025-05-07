# 📸 ToboSocial - Social Media Frontend

Frontend cho hệ thống mạng xã hội tương tác thời gian thực. Giao diện hiện đại, tối ưu trải nghiệm người dùng và quản trị, hỗ trợ các tính năng như: đăng bài, theo dõi người dùng, bình luận, like, báo cáo vi phạm, thông báo, quản trị nội dung.

---

## 🛠️ Công nghệ sử dụng

- ⚛️ React 18
- 🧩 Redux Toolkit
- 📦 Axios (tùy chỉnh với interceptor)
- 🎨 Ant Design UI
- ⚡ React Slick (Slider)
- 📈 Chart.js (Dashboard)
- ☁️ Cloudinary (Upload ảnh)
- 🌐 React Router DOM

---

## 🚀 Cài đặt

```bash
# 1. Clone repo
git clone https://github.com/yourusername/tobosocial-frontend.git
cd tobosocial-frontend

# 2. Cài dependency
npm install
```

## ▶️ Khởi chạy

```bash
npm run dev
```

Sau khi chạy thành công, ứng dụng sẽ truy cập tại:
👉 `http://localhost:5173`

---

## ⚙️ Cấu trúc thư mục

```
src/
├── components/       # Các component tái sử dụng
├── pages/            # Trang chính: Home, Profile, Explore, Admin...
├── services/         # Gọi API với axios
├── redux/            # State management: auth, post, admin...
├── styles/           # Global và custom CSS
└── App.jsx           # Cấu hình route chính
```

---

## ✅ Tính năng nổi bật

### 👤 Người dùng

- Đăng ký, đăng nhập, đổi mật khẩu
- Đăng bài viết (ảnh/video), like, bình luận
- Theo dõi / bỏ theo dõi người dùng khác
- Xem hồ sơ người dùng, danh sách bài viết
- Báo cáo nội dung vi phạm
- Nhận thông báo theo thời gian thực

### 🛡️ Quản trị viên

- Dashboard tổng quan: số lượng user, bài viết, bình luận, báo cáo
- Quản lý người dùng: khoá, xoá, tìm kiếm, lọc
- Quản lý bài viết: xoá, lọc theo user/thời gian
- Quản lý bình luận, báo cáo vi phạm
- Cảnh báo và đánh dấu báo cáo đã xử lý

---

## 📦 Backend

> Dự án backend sử dụng Node.js, Express, MongoDB và Mongoose.  
> Xem tại: [🔗 Backend Repo](https://github.com/phuong261104/PTGDUDBE.git)

---
