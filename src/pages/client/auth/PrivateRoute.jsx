import { useSelector } from 'react-redux';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
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

    return children;
};

export default PrivateRoute;
