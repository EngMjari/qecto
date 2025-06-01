export default async function authFetch(url, options = {}) {
  const token = localStorage.getItem("access");
  console.log("Token from localStorage:", token);
  
  const headers = options.headers ? { ...options.headers } : {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const opts = { ...options, headers };
  
  const response = await fetch(url, opts);

  if (response.status === 401) {
    // اینجا می‌تونی کد رفرش توکن بزاری یا حداقل لاگ بزنی
    console.warn("Unauthorized! Token might be expired or invalid.");
  }

  return response;
}
