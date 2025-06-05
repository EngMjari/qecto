import React, { useEffect, useState } from 'react';
import TicketCreateForm from '../../Components/Tickets/TicketCreateForm';
import { fetchAllData } from '../../api/projectsApi';

const TicketCreatePage = () => {
  const [projects, setProjects] = useState([]);
  const [surveyRequests, setSurveyRequests] = useState({});
  const [expertRequests, setExpertRequests] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchAllData();
        console.log('داده‌های پروژه‌ها:', res.data); 
        setProjects(res.data.projects || []);
        setSurveyRequests(res.data.requests_summary?.survey_requests || {});
        setExpertRequests(res.data.requests_summary?.expert_requests || {});
      } catch (err) {
        console.error('خطا در دریافت داده‌های پروژه‌ها و درخواست‌ها', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div>در حال بارگذاری...</div>;

  return (
    <div className="container py-5">
      <TicketCreateForm
        projects={projects}
        projectRequests={surveyRequests}
        expertRequests={expertRequests}
      />
    </div>
  );
};

export default TicketCreatePage;
