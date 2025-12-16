'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { FaArrowLeft, FaCheckCircle, FaClock, FaBriefcase, FaUser, FaCalendarAlt, FaTasks } from 'react-icons/fa';
import styles from './JobDetail.module.css';

export default function JobDetail() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchJob();
    const interval = setInterval(fetchJob, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await axios.get(`/api/jobs/${id}`);
      setJob(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching job:', error);
      setLoading(false);
    }
  };

  const handleTaskToggle = async (taskKey: string) => {
    if (!job || saving) return;

    setSaving(true);
    const updatedTasks = {
      ...job.tasks,
      [taskKey]: {
        ...job.tasks[taskKey],
        completed: !job.tasks[taskKey].completed
      }
    };

    const allCompleted = Object.values(updatedTasks).every((t: any) => t.completed);

    try {
      await axios.put(`/api/jobs/${id}`, {
        tasks: updatedTasks,
        completed: allCompleted
      });
      setJob({
        ...job,
        tasks: updatedTasks,
        completed: allCompleted
      });
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const groupTasksByCategory = () => {
    if (!job || !job.tasks) return {};

    const grouped: any = {};
    Object.entries(job.tasks).forEach(([key, task]: [string, any]) => {
      const category = task.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push({ key, ...task });
    });

    return grouped;
  };

  if (loading) {
    return (
      <div className={styles.jobDetailContainer}>
        <div className={styles.loading}>Loading job details...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className={styles.jobDetailContainer}>
        <div className={styles.error}>Job not found</div>
        <button onClick={() => router.push('/')} className={styles.backBtn}>
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>
    );
  }

  const groupedTasks = groupTasksByCategory();
  const completedCount = Object.values(job.tasks || {}).filter((t: any) => t.completed).length;
  const totalCount = Object.keys(job.tasks || {}).length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className={styles.jobDetailContainer}>
      <div className={styles.jobDetailHeader}>
        <button onClick={() => router.push('/')} className={styles.backBtn}>
          <FaArrowLeft /> Back to Dashboard
        </button>
        <div className={styles.headerInfo}>
          <h1>{job.workerName}</h1>
          <span
            className={`${styles.statusBadge} ${job.completed ? styles.completed : styles.inProgress}`}
          >
            {job.completed ? <FaCheckCircle /> : <FaClock />}
            {job.completed ? 'Completed' : 'In Progress'}
          </span>
        </div>
      </div>

      <div className={styles.jobInfoCard}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>
            <FaBriefcase /> Work Type:
          </span>
          <span className={styles.infoValue}>{job.workType.replace(/_/g, ' ')}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>
            <FaUser /> Created By:
          </span>
          <span className={styles.infoValue}>{job.createdBy}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>
            <FaCalendarAlt /> Created Date:
          </span>
          <span className={styles.infoValue}>
            {new Date(job.createdAt).toLocaleString()}
          </span>
        </div>
        <div className={styles.progressBarContainer}>
          <div className={styles.progressLabel}>
            <FaTasks /> Progress: {completedCount} / {totalCount} tasks
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className={styles.progressPercentage}>{Math.round(progress)}%</div>
        </div>
      </div>

      <div className={styles.tasksSection}>
        <h2><FaTasks /> Tasks Checklist</h2>
        <div className={styles.tasksSectionC}>
          {Object.keys(groupedTasks).length === 0 ? (
            <div className={styles.noTasks}>No tasks available for this job type.</div>
          ) : (
            Object.entries(groupedTasks).map(([category, tasks]: [string, any]) => (
              <div key={category} className={styles.taskCategory}>
                <h3 className={styles.categoryTitle}>{category.replace(/_/g, ' ')}</h3>
                <div className={styles.tasksList}>
                  {tasks.map(({ key, task, completed }: any) => (
                    <label key={key} className={styles.taskItem}>
                      <input
                        type="checkbox"
                        checked={completed}
                        onChange={() => handleTaskToggle(key)}
                        disabled={saving}
                        className={styles.taskCheckbox}
                      />
                      <span className={`${styles.taskText} ${completed ? styles.completed : ''}`}>
                        {task.replace(/_/g, ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

