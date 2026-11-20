import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from '../styles/UpcomingSessions.module.css';
import '../styles/calendar-light.css';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import bgImage from '../assets/upcoming-bg.jpg';

function StarRating({ value = 0, onChange, readOnly = false, size = 20 }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
      {stars.map((s) => (
        <svg
          key={s}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          style={{
            cursor: readOnly ? 'default' : 'pointer',
            opacity: s <= value ? 1 : 0.35,
            transform: s <= value ? 'scale(1.05)' : 'none',
            transition: 'transform 0.12s, opacity 0.12s',
          }}
          onClick={() => {
            if (!readOnly && onChange) onChange(s);
          }}
          aria-label={`${s} star`}
        >
          <path
            d="M12 .587l3.668 7.431L23.6 9.748l-5.8 5.656L19.335 24 12 19.771 4.665 24l1.536-8.596L.401 9.748l7.932-1.73L12 .587z"
            fill="currentColor"
          />
        </svg>
      ))}
    </div>
  );
}

function SimpleModal({ open, title, message, onClose }) {
  if (!open) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <div style={{ margin: '12px 0' }}>{message}</div>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
}

export default function UpcomingSessions() {
  const { theme } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);
  const userEmail = localStorage.getItem('userEmail');
  const userName = localStorage.getItem('userName');
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [acceptingId, setAcceptingId] = useState(null);
  const [reschedulingId, setReschedulingId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [markingCompletedId, setMarkingCompletedId] = useState(null);
  const [form, setForm] = useState({ date: '', time: '', meetLink: '', estimatedDays: '' });
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '', reason: '' });

  const [uploadFiles, setUploadFiles] = useState([]);
  const [teacherFeedbackText, setTeacherFeedbackText] = useState('');
  const [teacherStarRating, setTeacherStarRating] = useState(0);
  const [learnerFeedbacks, setLearnerFeedbacks] = useState({});
  const [calendarDate, setCalendarDate] = useState(new Date());

  const [modal, setModal] = useState({ open: false, title: '', message: '' });

  useEffect(() => {
    if (userEmail) fetchSessions();
  }, [userEmail]);
  const normalizeSessionItem = (s) => {
    const id = s.id || s._id || (s._id === 0 ? s._id : undefined);
    const scheduledAt = s.scheduledAt || s.scheduledDate || s.scheduledDateTime || null;
    const teacherStarRating =
      typeof s.teacherRating !== 'undefined' ? s.teacherRating : s.teacherStarRating ?? 0;
    const requesterStarRating =
      typeof s.requesterRating !== 'undefined' ? s.requesterRating : s.requesterStarRating ?? 0;
    const rawFiles = s.noteFileUrls || s.noteFileUrls === 0 ? s.noteFileUrls : s.notes || s.files || s.uploads || [];
    const notes = Array.isArray(rawFiles) && rawFiles.length > 0 ? rawFiles.map((f) => (typeof f === 'string' ? { url: f } : f)) : [];
    const requesterEmail = s.requesterEmail || s.requester?.email || (s.from && s.fromEmail) || null;
    const receiverEmail = s.teacherEmail || s.receiverEmail || s.teacher?.email || (s.to && s.toEmail) || null;

    return {
      ...s,
      id,
      scheduledAt,
      scheduledDate: scheduledAt,
      teacherStarRating,
      requesterStarRating,
      notes,
      requesterEmail,
      receiverEmail,
      rescheduleReason: s.rescheduleReason || s.rescheduleNote || '',
      rescheduledBy: s.rescheduledBy || null,
    };
  };

  const fetchSessions = async () => {
    try {
      const { data } = await axios.get('http://localhost:5137/api/sessions/requests', {
        params: { email: userEmail },
      });

      const rawSent = data.sent || [];
      const rawReceived = data.received || [];

      const normalizedSent = rawSent.map(normalizeSessionItem);
      const normalizedReceived = rawReceived.map(normalizeSessionItem);

      setSent(normalizedSent);
      setReceived(normalizedReceived);

      const all = [...normalizedSent, ...normalizedReceived];
      setScheduled(all.filter((s) => ['accepted', 'completed', 'rescheduled'].includes(s.status)));
    } catch (e) {
      console.error('Failed to fetch sessions:', e);
    }
  };

  const handleChange = (e, state, setter) => {
    setter({ ...state, [e.target.name]: e.target.value });
  };

  const handleAccept = async (id) => {
    const scheduledAt = new Date(`${form.date}T${form.time}`);
    if (!form.date || !form.time || scheduledAt <= new Date()) {
      alert('Please provide a future date and time.');
      return;
    }
    const meetPattern =  /^(https?:\/\/)?(meet\.google\.com\/[a-z0-9-]+|zoom\.us\/j\/\d+|teams\.microsoft\.com\/l\/meetup-join\/[a-zA-Z0-9/%?&=_-]+)/i;
    if (!meetPattern.test(form.meetLink.trim())) {
      alert('Please enter a valid Google Meet, Zoom, or Microsoft Teams link.');
      return;
    }
    try {
      await axios.post('http://localhost:5137/api/sessions/update-status', {
        requestId: id,
        status: 'accepted',
        scheduledAt: scheduledAt.toISOString(),
        meetLink: form.meetLink,
        estimatedDays: Number(form.estimatedDays),
      });
      resetAccept();
      await fetchSessions();
    } catch (e) {
      console.error('Accept failed:', e);
    }
  };

  const handleDecision = (req, decision) => {
    if (decision === 'rejected') {
      const reason = prompt('Optional rejection reason:');
      axios
        .post('http://localhost:5137/api/sessions/update-status', {
          requestId: req.id,
          status: 'rejected',
          rejectionNote: reason,
        })
        .then(fetchSessions)
        .catch((err) => {
          console.error('Reject failed:', err);
          alert('Failed to reject the request.');
        });
    } else {
      setAcceptingId(req.id);
    }
  };

  const handleReschedule = async (id) => {
    const { date, time, reason } = rescheduleData;
    if (!date || !time || !reason.trim()) {
      alert('Please provide date, time, and reschedule reason.');
      return;
    }
    const newDateTime = new Date(`${date}T${time}`);
    if (newDateTime <= new Date()) {
      alert('Please choose a future date and time.');
      return;
    }

    const session = [...sent, ...received, ...scheduled].find((s) => {
      return (s.id === id || s._id === id || s.id === String(id) || s._id === String(id));
    });

    const rescheduledBy = session && (session.receiverEmail === userEmail || session.teacherEmail === userEmail) ? 'teacher' : 'learner';

    try {
      await axios.post('http://localhost:5137/api/sessions/reschedule', {
        requestId: id,
        newDate: newDateTime.toISOString(),
        rescheduledBy,
        rescheduleReason: reason.trim(),
      });
      resetReschedule();
      fetchSessions();
    } catch (e) {
      console.error('Reschedule failed:', e);
      if (e?.response?.data?.error) {
        alert(`Reschedule failed: ${e.response.data.error}`);
      } else {
        alert('Reschedule failed. Check console for details.');
      }
    }
  };

  const handleNoteUpload = async (id) => {
    if (uploadFiles.length === 0) {
      alert('Please select files to upload.');
      return;
    }
    const data = new FormData();
    uploadFiles.forEach((file) => data.append('files', file));
    data.append('requestId', id);
    try {
      await axios.post('http://localhost:5137/api/sessions/upload-notes', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Notes uploaded successfully.');
      resetUpload();
      fetchSessions();
    } catch (e) {
      console.error('Note upload failed:', e);
      alert('Failed to upload notes.');
    }
  };

  const handleTeacherUpload = async (id) => {
    if (!teacherStarRating || !teacherFeedbackText.trim()) {
      alert('Feedback and star rating are required.');
      return;
    }
    const data = new FormData();
    if (uploadFiles.length > 0) {
      uploadFiles.forEach((file) => data.append('files', file));
    }
    data.append('feedback', teacherFeedbackText.trim());
    data.append('starRating', teacherStarRating);
    data.append('requestId', id);
    try {
      await axios.post('http://localhost:5137/api/sessions/upload-notes-feedback', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      resetMarkCompleted();
      fetchSessions();
    } catch (e) {
      console.error('Upload failed:', e);
    }
  };

  const markAsCompleted = async (id, scheduledAt) => {
    if (!scheduledAt) {
      alert('Session has no scheduled time.');
      return;
    }
    if (new Date() < new Date(scheduledAt)) {
      setModal({
        open: true,
        title: 'Cannot mark as completed',
        message: 'You cannot mark session as completed before its scheduled time.',
      });
      return;
    }

    if (!teacherStarRating || !teacherFeedbackText.trim()) {
      alert('Please provide teacher feedback and star rating before marking as completed.');
      return;
    }

    try {
      if (uploadFiles.length > 0) {
        const data = new FormData();
        uploadFiles.forEach((file) => data.append('files', file));
        data.append('feedback', teacherFeedbackText.trim());
        data.append('starRating', teacherStarRating);
        data.append('requestId', id);
        await axios.post('http://localhost:5137/api/sessions/upload-notes-feedback', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post('http://localhost:5137/api/sessions/upload-notes-feedback', {
          requestId: id,
          feedback: teacherFeedbackText.trim(),
          starRating: teacherStarRating,
        });
      }

      await axios.post('http://localhost:5137/api/sessions/mark-complete', {
        requestId: id,
      });

      resetMarkCompleted();
      fetchSessions();
      setModal({ open: true, title: 'Completed', message: (t('upcoming.completed')) });
    } catch (e) {
      console.error('Mark complete failed:', e);
      alert('Failed to mark session as completed. Please try again.');
    }
  };

  const openCertificate = async (id) => {
    try {
      if (!userEmail) {
      throw new Error('No logged-in email found in localStorage');
    }
      const resp = await axios.get(`http://localhost:5137/api/sessions/certificate/${id}?email=${userEmail}`, {
        responseType: 'blob' ,
    });

      const contentType = resp.headers['content-type'] || 'application/pdf';
      const url = window.URL.createObjectURL(new Blob([resp.data], { type: contentType }));
      
      const link = document.createElement('a');
      link.href = url;
      const filename = `SkillNova_Certificate_${id}.pdf`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Certificate fetch error:', e);
      setModal({ open: true, title: 'Certificate Error', message: (t('upcoming.CertificateError.')) });
    }
  };

  const handleLearnerFeedback = async (sessionId) => {
    const starRating = learnerFeedbacks[sessionId]?.star || 0;
    const feedback = learnerFeedbacks[sessionId]?.text || '';
    if (!starRating || !feedback.trim()) {
      alert('Please provide both feedback and star rating.');
      return;
    }
    try {
      await axios.post('http://localhost:5137/api/sessions/submit-feedback', {
        requestId: sessionId,
        requesterFeedback: feedback.trim(),
        requesterRating: Number(starRating),
      });
      alert(t('upcoming.thankYouFeedback'));
      fetchSessions();
    } catch (e) {
      console.error('Learner feedback error:', e);
    }
  };

  const resetAccept = () => setAcceptingId(null);
  const resetReschedule = () => {
    setReschedulingId(null);
    setRescheduleData({ date: '', time: '', reason: '' });
  };
  const resetUpload = () => {
    setUploadingId(null);
    setUploadFiles([]);
  };
  const resetMarkCompleted = () => {
    setMarkingCompletedId(null);
    setTeacherFeedbackText('');
    setTeacherStarRating(0);
    setUploadFiles([]);
  };

  const isCompleted = (session) => session.status === 'completed';
  const getLocalDateString = (dateObj) =>
    dateObj.getFullYear() +
    '-' +
    String(dateObj.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(dateObj.getDate()).padStart(2, '0');

  const sessionsByDate = scheduled.reduce((acc, session) => {
    if (!session.scheduledAt) return acc;
    const dateStr = getLocalDateString(new Date(session.scheduledAt));
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(session);
    return acc;
  }, {});

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const dateStr = getLocalDateString(date);
    if (sessionsByDate[dateStr]?.length) {
      return (
        <div className={styles.calendarDot} title="Session">
          •
        </div>
      );
    }
    return null;
  };

  const selectedDateStr = getLocalDateString(calendarDate);
  const sessionsOnSelectedDate = sessionsByDate[selectedDateStr] || [];

  const canMarkCompleted = (scheduledAt) => {
    if (!scheduledAt) return false;
    return new Date() >= new Date(scheduledAt);
  };

  const renderNotesForLearner = (session) => {
    const filesArray = session.notes || session.files || session.uploads || [];
    if (!filesArray.length) return null;

    return (
      <div className={styles.notesList}>
        <b>Notes:</b>
        <ul>
          {filesArray.map((f, idx) => {
            const filename = `Note ${idx + 1}`;
            const url = f.url || f.path || f.location || '';
            return (
              <li key={`${session.id || session.scheduledAt || 'sess'}-note-${idx}`}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {filename}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const SelectedFilesList = ({ files, onRemove, prefix }) => {
    if (!files || files.length === 0) return null;
    return (
      <div className={styles.selectedFiles}>
        <b>Selected files:</b>
        <ul>
          {files.map((f, i) => (
            <li key={`${prefix || 'file'}-file-${i}-${f.name}-${f.lastModified || 0}`}>
              {f.name}{' '}
              <button
                style={{ marginLeft: 8 }}
                onClick={() => {
                  const next = files.filter((_, idx) => idx !== i);
                  onRemove(next);
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className={`${styles.pageWrapper} ${theme === 'dark' ? styles.dark : ''}`}>
      <SimpleModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal({ open: false, title: '', message: '' })}
      />

      <div
        className={styles.container}
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          color: theme === 'dark' ? 'white' : 'black',
          minHeight: '100vh',
          padding: '1rem',
        }}
      >
        <h1>{t('upcoming.title')}</h1>

        <section>
          <h2>{t('upcoming.sentRequests')}</h2>
          {sent.length === 0 && <p>{t('upcoming.noSent')}</p>}
          {sent.map((session, idx) => {
            const isScheduled = ['accepted', 'completed', 'rescheduled'].includes(session.status);
            const isLearner = session.requesterEmail === userEmail;
            const isTeacher = session.teacherEmail === userEmail;
            const sid = session.id || session._id;

            return (
              <div key={`${sid || session.scheduledAt || 'sent'}-${idx}`} className={styles.sessionCard}>
                <p><b>Skill:</b> {session.skillName}</p>
                <p><b>To:</b> {session.to || session.teacherName || session.teacherEmail}</p>
                <p><b>Status:</b> {session.status}</p>
                {isScheduled && session.scheduledAt && (
                  <p><b>Scheduled At:</b> {new Date(session.scheduledAt).toLocaleString()}</p>
                )}

                {/* Show reschedule reason only to the opposite participant */}
                {session.status === 'rescheduled' && session.rescheduleReason && (
                  ((isTeacher && session.rescheduledBy === 'learner') ||
                    (isLearner && session.rescheduledBy === 'teacher')) && (
                    <p><b>Reschedule Reason:</b> {session.rescheduleReason}</p>
                  )
                )}

                {isScheduled && !isCompleted(session) && (
                  <>
                    {reschedulingId === sid ? (
                      <>
                        <input
                          type="date"
                          name="date"
                          value={rescheduleData.date}
                          onChange={(e) => handleChange(e, rescheduleData, setRescheduleData)}
                        />
                        <input
                          type="time"
                          name="time"
                          value={rescheduleData.time}
                          onChange={(e) => handleChange(e, rescheduleData, setRescheduleData)}
                        />
                        <textarea
                          name="reason"
                          value={rescheduleData.reason}
                          onChange={(e) => handleChange(e, rescheduleData, setRescheduleData)}
                          placeholder={t('upcoming.reasonReschedule')}
                        />
                        <button onClick={() => handleReschedule(sid)}>{t('upcoming.submitReschedule')}</button>
                        <button onClick={resetReschedule}>Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => setReschedulingId(sid)}>{t('upcoming.reschedule')}</button>
                    )}
                  </>
                )}

                {session.receiverEmail === userEmail && isScheduled && (
                  <>
                    {uploadingId === sid ? (
                      <>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png,.txt,.docx"
                          onChange={(e) => setUploadFiles([...e.target.files])}
                        />
                        <SelectedFilesList files={uploadFiles} onRemove={setUploadFiles} />
                        <button onClick={() => handleNoteUpload(sid)}>{t('upcoming.uploadNotes')}</button>
                        <button onClick={resetUpload}>Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => setUploadingId(sid)}>{t('upcoming.uploadNotes')}</button>
                    )}
                  </>
                )}

                {session.requesterEmail === userEmail && renderNotesForLearner(session)}

                {session.teacherFeedback && session.requesterEmail === userEmail && (
                  <div className={styles.feedbackBlock}>
                    <b>Instructor Feedback:</b>
                    <p>{session.teacherFeedback}</p>
                    <div>
                      <StarRating value={session.teacherStarRating || 0} readOnly />
                      <span style={{ marginLeft: 8 }}>{session.teacherStarRating || 0}/5</span>
                    </div>
                  </div>
                )}

                {session.receiverEmail === userEmail && !isCompleted(session) && isScheduled && (
                  <>
                    {markingCompletedId === sid ? (
                      <>
                        <textarea
                          value={teacherFeedbackText}
                          onChange={(e) => setTeacherFeedbackText(e.target.value)}
                          placeholder={t('upcoming.feedbackLearner')}
                        />
                        <div style={{ margin: '8px 0' }}>
                          <StarRating value={teacherStarRating} onChange={setTeacherStarRating} />
                        </div>
                        <div>
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.txt,.docx"
                            onChange={(e) => setUploadFiles([...e.target.files])}
                          />
                          <SelectedFilesList files={uploadFiles} onRemove={setUploadFiles} />
                        </div>
                        <button
                          onClick={() => markAsCompleted(sid, session.scheduledAt)}
                        >
                          {t('upcoming.markCompleted')}
                        </button>
                        <button onClick={resetMarkCompleted}>Cancel</button>
                      </>
                    ) : (
                      <button
                        onClick={() => setMarkingCompletedId(sid)}
                        title={
                          !canMarkCompleted(session.scheduledAt)
                            ? 'Cannot mark as completed before scheduled time'
                            : ''
                        }
                        disabled={!canMarkCompleted(session.scheduledAt)}
                      >
                        {t('upcoming.markCompleted')}
                      </button>
                    )}
                  </>
                )}

                {session.status === 'pending' && <p>{t('upcoming.waitingResponse')}</p>}
                {session.status === 'rejected' && (
                  <p>Rejected{session.rejectionNote ? `: ${session.rejectionNote}` : ''}</p>
                )}
              </div>
            );
          })}
        </section>
        <section>
          <h2>{t('upcoming.receivedRequests')}</h2>
          {received.length === 0 && <p>{t('upcoming.noReceived')}</p>}
          {received.map((session, idx) => {
            const isScheduled = ['accepted', 'completed', 'rescheduled'].includes(session.status);
            const isPending = session.status === 'pending';
            const isLearner = session.requesterEmail === userEmail;
            const isTeacher = session.teacherEmail === userEmail || session.receiverEmail === userEmail;
            const sid = session.id || session._id;

            return (
              <div key={`${sid || session.scheduledAt || 'recv'}-${idx}`} className={styles.sessionCard}>
                <p><b>Skill:</b> {session.skillName}</p>
                <p><b>From:</b> {session.from || session.requesterName || session.requesterEmail}</p>
                <p><b>Status:</b> {session.status}</p>
                {isScheduled && session.scheduledAt && (
                  <p><b>Scheduled At:</b> {new Date(session.scheduledAt).toLocaleString()}</p>
                )}

                {isPending && (
                  <>
                    <button onClick={() => handleDecision(session, 'accepted')}>{t('upcoming.accept')}</button>
                    <button onClick={() => handleDecision(session, 'rejected')}>{t('upcoming.reject')}</button>
                  </>
                )}

                {acceptingId === sid && (
                  <>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={(e) => handleChange(e, form, setForm)}
                    />
                    <input
                      type="time"
                      name="time"
                      value={form.time}
                      onChange={(e) => handleChange(e, form, setForm)}
                    />
                    <input
                      type="text"
                      name="meetLink"
                      value={form.meetLink}
                      onChange={(e) => handleChange(e, form, setForm)}
                      placeholder={t('upcoming.meetLink')}
                    />
                    <input
                      type="number"
                      name="estimatedDays"
                      value={form.estimatedDays}
                      onChange={(e) => handleChange(e, form, setForm)}
                      placeholder="Estimated days"
                      min={1}
                    />
                    <button onClick={() => handleAccept(sid)}>{t('upcoming.confirmAccept')}</button>
                    <button onClick={resetAccept}>Cancel</button>
                  </>
                )}

                {isScheduled && !isCompleted(session) && (
                  <>
                    {reschedulingId === sid ? (
                      <>
                        <input
                          type="date"
                          name="date"
                          value={rescheduleData.date}
                          onChange={(e) => handleChange(e, rescheduleData, setRescheduleData)}
                        />
                        <input
                          type="time"
                          name="time"
                          value={rescheduleData.time}
                          onChange={(e) => handleChange(e, rescheduleData, setRescheduleData)}
                        />
                        <textarea
                          name="reason"
                          value={rescheduleData.reason}
                          onChange={(e) => handleChange(e, rescheduleData, setRescheduleData)}
                          placeholder={t('upcoming.reasonReschedule')}
                        />
                        <button onClick={() => handleReschedule(sid)}>{t('upcoming.submitReschedule')}</button>
                        <button onClick={resetReschedule}>Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => setReschedulingId(sid)}>{t('upcoming.reschedule')}</button>
                    )}
                  </>
                )}

                {session.receiverEmail === userEmail && isScheduled && (
                  <>
                    {uploadingId === sid ? (
                      <>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png,.txt,.docx"
                          onChange={(e) => setUploadFiles([...e.target.files])}
                        />
                        <SelectedFilesList files={uploadFiles} onRemove={setUploadFiles} />
                        <button onClick={() => handleNoteUpload(sid)}>{t('upcoming.uploadNotes')}</button>
                        <button onClick={resetUpload}>Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => setUploadingId(sid)}>{t('upcoming.uploadNotes')}</button>
                    )}
                  </>
                )}

                {session.requesterEmail === userEmail && renderNotesForLearner(session)}

                {session.receiverEmail === userEmail && !isCompleted(session) && isScheduled && (
                  <>
                    {markingCompletedId === sid ? (
                      <>
                        <textarea
                          value={teacherFeedbackText}
                          onChange={(e) => setTeacherFeedbackText(e.target.value)}
                          placeholder={t('upcoming.feedbackLearner')}
                        />
                        <div style={{ margin: '8px 0' }}>
                          <StarRating value={teacherStarRating} onChange={setTeacherStarRating} />
                        </div>
                        <div>
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.txt,.docx"
                            onChange={(e) => setUploadFiles([...e.target.files])}
                          />
                          <SelectedFilesList files={uploadFiles} onRemove={setUploadFiles} />
                        </div>
                        <button onClick={() => markAsCompleted(sid, session.scheduledAt)}>
                          {t('upcoming.markCompleted')}
                        </button>
                        <button onClick={resetMarkCompleted}>Cancel</button>
                      </>
                    ) : (
                      <button
                        onClick={() =>{
                          if (!canMarkCompleted(session.scheduledAt)) {
                            setModal({
                            open: true,
                            title: 'Cannot mark as completed',
                            message: 'You cannot mark the session as completed before its scheduled time.',
                            });
                          return;
                        } setMarkingCompletedId(sid)}}
                        title={
                          !canMarkCompleted(session.scheduledAt)
                            ? 'Cannot mark as completed before scheduled time'
                            : ''
                        }
                      >
                        {t('upcoming.markCompleted')}
                      </button>
                    )}
                  </>
                )}

                {/* Show reschedule reason only to opposite participant */}
                {session.status === 'rescheduled' && session.rescheduleReason && (
                  ((isTeacher && session.rescheduledBy === 'learner') ||
                    (isLearner && session.rescheduledBy === 'teacher')) && (
                    <p><b>Reschedule Reason:</b> {session.rescheduleReason}</p>
                  )
                )}

                {session.teacherFeedback && session.requesterEmail === userEmail && (
                  <div className={styles.feedbackBlock}>
                    <b>Instructor Feedback:</b>
                    <p>{session.teacherFeedback}</p>
                    <div>
                      <StarRating value={session.teacherStarRating || 0} readOnly />
                      <span style={{ marginLeft: 8 }}>{session.teacherStarRating || 0}/5</span>
                    </div>
                  </div>
                )}

                {isCompleted(session) && session.requesterEmail === userEmail && !session.requesterStarRating && (
                  <>
                    <textarea
                      value={learnerFeedbacks[session.id]?.text || ''}
                      onChange={(e) =>
                        setLearnerFeedbacks((prev) => ({
                          ...prev,
                          [session.id]: {
                            ...prev[session.id],
                            text: e.target.value,
                          },
                        }))
                      }
                      placeholder={t('upcoming.feedbackInstructor')}
                    />
                    <div style={{ margin: '8px 0' }}>
                      <StarRating
                        value={Number(learnerFeedbacks[session.id]?.star || 0)}
                        onChange={(val) =>
                          setLearnerFeedbacks((prev) => ({
                            ...prev,
                            [session.id]: {
                              ...prev[session.id],
                              star: val,
                            },
                          }))
                        }
                      />
                    </div>
                    <button onClick={() => handleLearnerFeedback(session.id)}>{t('upcoming.submitFeedback')}</button>
                  </>
                )}

                {session.requesterFeedback && session.receiverEmail === userEmail && (
                  <div className={styles.feedbackBlock}>
                    <b>Learner Feedback:</b>
                    <p>{session.requesterFeedback}</p>
                    <div>
                      <StarRating value={session.requesterStarRating || 0} readOnly />
                      <span style={{ marginLeft: 8 }}>{session.requesterStarRating || 0}/5</span>
                    </div>
                  </div>
                )}

                {isCompleted(session) && session.requesterEmail === userEmail && session.requesterStarRating && (
                  <button onClick={() => openCertificate(session._id)}>{t('upcoming.downloadCertificate')}</button>
                )}
              </div>
            );
          })}
        </section>

        <section>
          <h2>{t('upcoming.scheduledSessions')}</h2>
          {scheduled.length === 0 && <p>{t('upcoming.noScheduled')}</p>}
          {scheduled.map((session, idx) => {
            const isLearner = session.requesterEmail === userEmail;
            const isTeacher = session.teacherEmail === userEmail || session.receiverEmail === userEmail;
            const sid = session.id || session._id;

            return (
              <div key={`${sid || session.scheduledAt || 'sched'}-${idx}`} className={styles.sessionCard}>
                <p><b>Skill:</b> {session.skillName || session.skill}</p>
                <p><b>Date:</b> {session.scheduledAt ? new Date(session.scheduledAt).toLocaleString() : '—'}</p>
                <p><b>Status:</b> {session.status}</p>

                {!isCompleted(session) && (
                  <>
                    {reschedulingId === sid ? (
                      <>
                        <input
                          type="date"
                          name="date"
                          value={rescheduleData.date}
                          onChange={(e) => handleChange(e, rescheduleData, setRescheduleData)}
                        />
                        <input
                          type="time"
                          name="time"
                          value={rescheduleData.time}
                          onChange={(e) => handleChange(e, rescheduleData, setRescheduleData)}
                        />
                        <textarea
                          name="reason"
                          value={rescheduleData.reason}
                          onChange={(e) => handleChange(e, rescheduleData, setRescheduleData)}
                          placeholder={t('upcoming.reasonReschedule')}
                        />
                        <button onClick={() => handleReschedule(sid)}>{t('upcoming.submitReschedule')}</button>
                        <button onClick={resetReschedule}>Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => setReschedulingId(sid)}>Reschedule</button>
                    )}
                  </>
                )}

                {isTeacher && (
                  <>
                    {uploadingId === sid ? (
                      <>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png,.txt,.docx"
                          onChange={(e) => setUploadFiles([...e.target.files])}
                        />
                        <SelectedFilesList files={uploadFiles} onRemove={setUploadFiles} />
                        <button onClick={() => handleNoteUpload(sid)}>{t('upcoming.uploadNotes')}</button>
                        <button onClick={resetUpload}>Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => setUploadingId(sid)}>{t('upcoming.uploadNotes')}</button>
                    )}
                  </>
                )}

                {isLearner && renderNotesForLearner(session)}

                {isTeacher && !isCompleted(session) && (
                  <>
                    {markingCompletedId === sid ? (
                      <>
                        <textarea
                          value={teacherFeedbackText}
                          onChange={(e) => setTeacherFeedbackText(e.target.value)}
                          placeholder={t('upcoming.feedbackLearner')}
                        />
                        <div style={{ margin: '8px 0' }}>
                          <StarRating value={teacherStarRating} onChange={setTeacherStarRating} />
                        </div>
                        <div>
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.txt,.docx"
                            onChange={(e) => setUploadFiles([...e.target.files])}
                          />
                          <SelectedFilesList files={uploadFiles} onRemove={setUploadFiles} />
                        </div>
                        <button
                          onClick={() => markAsCompleted(sid, session.scheduledAt)}
                        >
                          {t('upcoming.markCompleted')}
                        </button>
                        <button onClick={resetMarkCompleted}>Cancel</button>
                      </>
                    ) : (
                      <button
                        onClick={() => setMarkingCompletedId(sid)}
                        title={
                          !canMarkCompleted(session.scheduledAt)
                            ? 'Cannot mark as completed before scheduled time'
                            : ''
                        }
                      >
                        {t('upcoming.markCompleted')}
                      </button>
                    )}
                  </>
                )}

                {isLearner && isCompleted(session) && !session.requesterStarRating && (
                  <>
                    <textarea
                      value={learnerFeedbacks[session.id]?.text || ''}
                      onChange={(e) =>
                        setLearnerFeedbacks((prev) => ({
                          ...prev,
                          [session.id]: {
                            ...prev[session.id],
                            text: e.target.value,
                          },
                        }))
                      }
                      placeholder={t('upcoming.feedbackInstructor')}
                    />
                    <div style={{ margin: '8px 0' }}>
                      <StarRating
                        value={Number(learnerFeedbacks[session.id]?.star || 0)}
                        onChange={(val) =>
                          setLearnerFeedbacks((prev) => ({
                            ...prev,
                            [session.id]: {
                              ...prev[session.id],
                              star: val,
                            },
                          }))
                        }
                      />
                    </div>
                    <button onClick={() => handleLearnerFeedback(session.id)}>{t('upcoming.submitFeedback')}</button>
                  </>
                )}

                {isLearner && session.teacherFeedback && (
                  <div className={styles.feedbackBlock}>
                    <b>Instructor Feedback:</b>
                    <p>{session.teacherFeedback}</p>
                    <div>
                      <StarRating value={session.teacherStarRating || 0} readOnly />
                      <span style={{ marginLeft: 8 }}>{session.teacherStarRating || 0}/5</span>
                    </div>
                  </div>
                )}

                {isTeacher && session.requesterFeedback && (
                  <div className={styles.feedbackBlock}>
                    <b>Learner Feedback:</b>
                    <p>{session.requesterFeedback}</p>
                    <div>
                      <StarRating value={session.requesterStarRating || 0} readOnly />
                      <span style={{ marginLeft: 8 }}>{session.requesterStarRating || 0}/5</span>
                    </div>
                  </div>
                )}

                {isCompleted(session) && isLearner && session.requesterStarRating && (
                  <button onClick={() => openCertificate(session.id)}>{t('upcoming.downloadCertificate')}</button>
                )}
              </div>
            );
          })}
        </section>

        <section>
          <h2>{t('upcoming.calendar')}</h2>
          <Calendar onChange={setCalendarDate} value={calendarDate} tileContent={tileContent} className="calendarWrapper" />
          <div>
            <h3>{t('upcoming.sessionsOn')} {calendarDate.toDateString()}</h3>
            {sessionsOnSelectedDate.map((session, idx) => (
              <div
                key={`${session.id || session.scheduledAt || 'cal'}-${idx}-${session.skillName || ''}`}
                className={styles.sessionCard}
              >
                <p><b>Skill:</b> {session.skillName}</p>
                <p><b>Time:</b> {session.scheduledAt ? new Date(session.scheduledAt).toLocaleTimeString() : '—'}</p>
                <p><b>Status:</b> {session.status}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
