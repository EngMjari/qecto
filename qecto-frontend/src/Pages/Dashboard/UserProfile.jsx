import React, { useState } from 'react';

const UserProfile = () => {
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const handleChange = (e) => {
    setUserInfo({
      ...userInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // ارسال اطلاعات به سرور یا ذخیره تغییرات
    alert('اطلاعات کاربری ذخیره شد');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>اطلاعات کاربری</h2>
      <label>نام:</label>
      <input name="name" value={userInfo.name} onChange={handleChange} />

      <label>ایمیل:</label>
      <input name="email" value={userInfo.email} onChange={handleChange} />

      <label>تلفن:</label>
      <input name="phone" value={userInfo.phone} onChange={handleChange} />

      <button type="submit">ذخیره</button>
    </form>
  );
};

export default UserProfile;
