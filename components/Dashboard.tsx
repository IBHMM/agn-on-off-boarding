'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FaPlus, FaTrash, FaCheckCircle, FaClock, FaFilter, FaUser, FaBriefcase, FaTasks, FaTimes } from 'react-icons/fa';
import AddWorkModal from './AddWorkModal';
import styles from './Dashboard.module.css';

const CREATORS = ['Ibrahim', 'Asiman', 'Ilqar', 'Elvin', 'Canəli'];
const WORK_TYPES = [
  'Yeni_İşçi_Üçün_Onboarding',
  'İşçi_İşdən_Çıxdıqda_Offboarding'
];

export default function Dashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    workType: '',
    status: '',
    createdBy: ''
  });
  const router = useRouter();

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, filters]);

  const applyFilters = () => {
    let filtered = [...jobs];

    if (filters.workType) {
      filtered = filtered.filter(job => job.workType === filters.workType);
    }

    if (filters.status) {
      if (filters.status === 'completed') {
        filtered = filtered.filter(job => job.completed === true);
      } else if (filters.status === 'in-progress') {
        filtered = filtered.filter(job => job.completed === false);
      }
    }

    if (filters.createdBy) {
      filtered = filtered.filter(job => job.createdBy === filters.createdBy);
    }

    setFilteredJobs(filtered);
  };

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      workType: '',
      status: '',
      createdBy: ''
    });
  };

  const fetchJobs = async () => {
    try {
      const response = await axios.get('/api/jobs');
      setJobs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setLoading(false);
    }
  };

  const handleJobClick = (jobId: string) => {
    router.push(`/job/${jobId}`);
  };

  const handleDeleteJob = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await axios.delete(`/api/jobs/${jobId}`);
        fetchJobs();
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Failed to delete job');
      }
    }
  };

  const getStatusColor = (completed: boolean) => {
    return completed ? '#4caf50' : '#ff9800';
  };

  const getStatusText = (completed: boolean) => {
    return completed ? 'Completed' : 'In Progress';
  };

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <h1>Onboarding & Offboarding Jobs</h1>
        <button className={styles.addWorkBtn} onClick={() => setShowModal(true)}>
          <FaPlus /> Add New Work
        </button>
      </div>

      <div className={styles.filtersSection}>
        <div className={styles.filterGroup}>
          <label htmlFor="filter-work-type">
            <FaBriefcase /> Work Type:
          </label>
          <select
            id="filter-work-type"
            value={filters.workType}
            onChange={(e) => handleFilterChange('workType', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Types</option>
            {WORK_TYPES.map(type => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="filter-status">
            <FaFilter /> Status:
          </label>
          <select
            id="filter-status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Status</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="filter-creator">
            <FaUser /> Created By:
          </label>
          <select
            id="filter-creator"
            value={filters.createdBy}
            onChange={(e) => handleFilterChange('createdBy', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Creators</option>
            {CREATORS.map(creator => (
              <option key={creator} value={creator}>
                {creator}
              </option>
            ))}
          </select>
        </div>

        {(filters.workType || filters.status || filters.createdBy) && (
          <button className={styles.clearFiltersBtn} onClick={clearFilters}>
            <FaTimes /> Clear Filters
          </button>
        )}
      </div>

      <div className={styles.jobsGrid}>
        {filteredJobs.length === 0 ? (
          <div className={styles.noJobs}>
            <p>{jobs.length === 0 ? 'No jobs yet. Click "Add New Work" to create one.' : 'No jobs match the selected filters.'}</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className={styles.jobCard}
              onClick={() => handleJobClick(job.id)}
            >
              <div className={styles.jobCardHeader}>
                <h3>{job.workerName}</h3>
                <span
                  className={styles.statusBadge}
                  style={{ backgroundColor: getStatusColor(job.completed) }}
                >
                  {job.completed ? <FaCheckCircle /> : <FaClock />}
                  {getStatusText(job.completed)}
                </span>
              </div>
              <div className={styles.jobCardBody}>
                <p className={styles.workType}>{job.workType.replace(/_/g, ' ')}</p>
                <p className={styles.createdBy}>Created by: {job.createdBy}</p>
                <p className={styles.createdDate}>
                  {new Date(job.createdAt).toLocaleDateString()}
                </p>
                <div className={styles.progressInfo}>
                  {Object.keys(job.tasks || {}).length > 0 && (
                    <p>
                      <FaTasks /> Tasks:{' '}
                      {Object.values(job.tasks || {}).filter((t: any) => t.completed).length} / {Object.keys(job.tasks || {}).length}
                    </p>
                  )}
                </div>
              </div>
              <button
                className={styles.deleteBtn}
                onClick={(e) => handleDeleteJob(e, job.id)}
              >
                <FaTrash /> Delete
              </button>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <AddWorkModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchJobs();
          }}
        />
      )}
    </div>
  );
}

