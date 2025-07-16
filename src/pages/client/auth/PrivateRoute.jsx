import { useSelector } from 'react-redux';
import { Result, Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const PrivateRoute = ({ children }) => {
    const user = useSelector(state => state.auth.user);
    const navigate = useNavigate();

    useEffect(() => {
        // delay 1s để đảm bảo redux state đã được cập nhật
        const timer = setTimeout(() => {
            if (!user)
                navigate('/login');
        }, 2000);
        return () => clearTimeout(timer);
    }, [user, navigate]);

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
    return children;
};

export default PrivateRoute;
