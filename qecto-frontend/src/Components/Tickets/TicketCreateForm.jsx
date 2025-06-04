import React, { useState, useEffect } from 'react';
import { Button, Form, Alert, Spinner } from 'react-bootstrap';
import { createTicket } from '../../api/ticketsApi';

const TicketCreateForm = ({ projects = [], onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState('all');
  const [availableRequests, setAvailableRequests] = useState([]);

  useEffect(() => {
    const selectedProject = projects.find((p) => p.id.toString() === selectedProjectId);
    setAvailableRequests(selectedProject?.requests || []);
    setSelectedRequestId('all');
  }, [selectedProjectId, projects]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const payload = {
        title,
        description,
      };

      if (selectedProjectId) {
        payload.related_project = selectedProjectId;
        payload.related_request = selectedRequestId !== 'all' ? selectedRequestId : null;
      }

      await createTicket(payload);

      setSuccessMsg('تیکت با موفقیت ارسال شد.');
      setTitle('');
      setDescription('');
      setSelectedProjectId('');
      setSelectedRequestId('all');
      setAvailableRequests([]);

      if (onSuccess) onSuccess();
    } catch (err) {
      setError('ارسال تیکت با خطا مواجه شد.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow">
      <h4 className="mb-4 text-end text-primary">ارسال تیکت جدید</h4>

      {error && <Alert variant="danger">{error}</Alert>}
      {successMsg && <Alert variant="success">{successMsg}</Alert>}

      <Form.Group className="mb-3 text-end">
        <Form.Label>پروژه (اختیاری)</Form.Label>
        <Form.Select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
        >
          <option value="">تیکت عمومی (بدون پروژه)</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {selectedProjectId && (
        <Form.Group className="mb-3 text-end">
          <Form.Label>درخواست مرتبط</Form.Label>
          <Form.Select
            value={selectedRequestId}
            onChange={(e) => setSelectedRequestId(e.target.value)}
          >
            <option value="all">تیکت مربوط به کل پروژه</option>
            {availableRequests.map((req) => (
              <option key={req.id} value={req.id}>
                {`${req.type === 'survey' ? 'نقشه‌برداری' : 'کارشناسی'} - ${new Date(req.created_at).toLocaleDateString('fa-IR')}`}
              </option>
            ))}
          </Form.Select>
          {availableRequests.length === 0 && (
            <div className="text-muted small mt-1">درخواستی برای این پروژه ثبت نشده است.</div>
          )}
        </Form.Group>
      )}

      <Form.Group className="mb-3 text-end">
        <Form.Label>عنوان تیکت</Form.Label>
        <Form.Control
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثلاً: مشکل در ورود به حساب"
          required
        />
      </Form.Group>

      <Form.Group className="mb-3 text-end">
        <Form.Label>توضیحات تیکت</Form.Label>
        <Form.Control
          as="textarea"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="توضیحات کامل مشکل یا درخواست شما..."
          required
        />
      </Form.Group>

      <div className="text-end">
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? <Spinner size="sm" animation="border" /> : 'ارسال تیکت'}
        </Button>
      </div>
    </Form>
  );
};

export default TicketCreateForm;
// TODO: وقتی تیکت ارسال میکنم پروژه و درخواست داخل دیتابیس نمیاد