'use client';

import { useEffect, useState } from 'react';
import SidebarMenu from '../../../components/SidebarMenu';
import UserInfoForm from '../../../components/UserInfoForm';
import AddressList from '../../../components/AddressList';
import ChangePasswordForm from '../../../components/ChangePasswordForm';
import OrderHistory from '../../../components/OrderHistory';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('info');

  
const fetchUser = async () => {
  try {
    const profileRes = await fetch('/api/account/profile');
    const profileData = await profileRes.json();

    if (profileData.user) {
      setUser(profileData.user);
    } else {
      setUser(null);
    }
  } catch (err) {
    console.error('Lỗi lấy user:', err);
    setUser(null);
  }
};

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="full-height-wrapper">
      <div className="user-profile-page">
        <SidebarMenu tab={tab} setTab={setTab} user={user} setUser={setUser} />

        <div className="user-profile-content">
          {tab === 'info' && <UserInfoForm user={user} onSuccess={fetchUser} />}
          {tab === 'address' && user && <AddressList userId={user.id} />}
          {tab === 'password' && user && <ChangePasswordForm userId={user.id} />}
          {tab === 'history' && user && <OrderHistory userId={user.id} />}
        </div>
      </div>
    </div>
  );
}