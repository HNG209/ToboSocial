import { useSelector } from 'react-redux';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    const { user } = useSelector(state => state.auth);

    if (!user) {
        return (
            <Result
                status="403"
                title="Unauthorized"
                subTitle="Bạn cần đăng nhập để truy cập trang này."
                extra={
                    <Button type="primary">
                        <Link to="/login">Đăng nhập</Link>
                    </Button>
                }
            />
        );
    }

    if (user.role !== 'admin') {
        return (
            <Result
                status="403"
                title="Không đủ quyền"
                subTitle="Trang này chỉ dành cho quản trị viên (admin)."
                extra={
                    <Button type="primary">
                        <Link to="/">Quay về trang chủ</Link>
                    </Button>
                }
            />
        );
    }

    return children;
};

export default AdminRoute;
