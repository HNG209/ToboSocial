import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import ImageUploader from './components/ImageUploader'
import VideoUploader from './components/VideoUploader'
import Card from './components/Card'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div className='container'>
      <div className="menu">
        Menu
      </div>
      <div className="content">
        <Card jobName="Lập trình viên" jobDescription="Lập trình viên là người viết mã cho các ứng dụng và phần mềm." id={1} deleteTodo={() => {}} />
        <Card jobName="Thiết kế đồ họa" jobDescription="Thiết kế đồ họa là người tạo ra các hình ảnh và đồ họa cho các sản phẩm." id={2} deleteTodo={() => {}} />
        <Card jobName="Quản lý dự án" jobDescription="Quản lý dự án là người quản lý và điều phối các dự án." id={3} deleteTodo={() => {}} />
        <Card jobName="Nhà phát triển web" jobDescription="Nhà phát triển web là người xây dựng và duy trì các trang web." id={4} deleteTodo={() => {}} />
        <Card jobName="Nhà phát triển ứng dụng di động" jobDescription="Nhà phát triển ứng dụng di động là người xây dựng và duy trì các ứng dụng di động." id={5} deleteTodo={() => {}} />
        <Card jobName="Nhà phát triển phần mềm" jobDescription="Nhà phát triển phần mềm là người xây dựng và duy trì các phần mềm." id={6} deleteTodo={() => {}} />
        <Card jobName="Nhà phát triển game" jobDescription="Nhà phát triển game là người xây dựng và duy trì các trò chơi." id={7} deleteTodo={() => {}} />
        <Card jobName="Nhà phát triển AI" jobDescription="Nhà phát triển AI là người xây dựng và duy trì các ứng dụng AI." id={8} deleteTodo={() => {}} />
        <Card jobName="Nhà phát triển blockchain" jobDescription="Nhà phát triển blockchain là người xây dựng và duy trì các ứng dụng blockchain." id={9} deleteTodo={() => {}} />
        <Card jobName="Nhà phát triển IoT" jobDescription="Nhà phát triển IoT là người xây dựng và duy trì các ứng dụng IoT." id={10} deleteTodo={() => {}} />
        <Card jobName="Nhà phát triển VR" jobDescription="Nhà phát triển VR là người xây dựng và duy trì các ứng dụng VR." id={11} deleteTodo={() => {}} />
      </div>
    </div>
    </>
  )
}

export default App
