import React from "react";

function Dashboard() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>داشبورد کاربر</h1>
      <p style={styles.welcome}>به پنل کاربری خود خوش آمدید!</p>

      <div style={styles.cardsContainer}>
        <div style={styles.card}>
          <h3>پروژه‌ها</h3>
          <p>مدیریت و مشاهده پروژه‌های فعال و گذشته شما</p>
        </div>

        <div style={styles.card}>
          <h3>تیکت‌ها</h3>
          <p>ارسال و پیگیری درخواست‌ها و پشتیبانی</p>
        </div>

        <div style={styles.card}>
          <h3>اطلاعیه‌ها</h3>
          <p>مشاهده آخرین اخبار و اطلاعیه‌های مهم</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px 40px",
    fontFamily: "'Vazir', sans-serif",
    color: "#002a3a",
    minHeight: "80vh",
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "10px",
    color: "#ff5700",
  },
  welcome: {
    fontSize: "1.2rem",
    marginBottom: "30px",
  },
  cardsContainer: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  card: {
    flex: "1 1 250px",
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 6px 15px rgba(0, 42, 58, 0.1)",
    transition: "transform 0.3s ease",
    cursor: "pointer",
  },
};

export default Dashboard;
