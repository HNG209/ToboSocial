import React, { useState } from 'react';
import { AppstoreOutlined, TableOutlined, SettingOutlined, PlaySquareOutlined, SaveOutlined, NotificationOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { FiBookmark } from 'react-icons/fi';
const items = [
    {
        label: 'Posts',
        key: 'posts',
        icon: <AppstoreOutlined />,
    },
    {
        label: 'Reels',
        key: 'reels',
        icon: <PlaySquareOutlined />,
    },
    {
        label: 'Saved',
        key: 'saved',
        icon: <FiBookmark className="text-black hover:text-gray-400" />,
    },
    {
        label: 'Tags',
        key: 'Tags',
        icon: <NotificationOutlined />,
    },
];
const ProfileMenu = () => {
    const [current, setCurrent] = useState('posts');
    const onClick = e => {
        console.log('click ', e);
        setCurrent(e.key);
    };
    return <Menu
        style={{ backgroundColor: '#f9fafb', color: '#fff' }}
        className='flex items-center justify-center'
        onClick={onClick}
        selectedKeys={[current]}
        mode="horizontal"
        items={items} />;
};
export default ProfileMenu;