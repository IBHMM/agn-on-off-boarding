'use client'

import { useState } from 'react';
import axios from 'axios';
import { FaTimes, FaUser, FaBriefcase } from 'react-icons/fa';
import styles from './AddWorkModal.module.css';

const CREATORS = ['ibrahim', 'asiman', 'Ilqar', 'taleh', 'elvin', 'Eli'];
const WORK_TYPES = [
  'Yeni_İşçi_Üçün_Onboarding',
  'İşçi_İşdən_Çıxdıqda_Offboarding'
];

interface AddWorkModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddWorkModal({ onClose, onSuccess }: AddWorkModalProps) {
  const [formData, setFormData] = useState({
    createdBy: '',
    workerName: '',
    workType: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.createdBy || !formData.workerName || !formData.workType) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('/api/jobs', formData);
      onSuccess();
    } catch (error) {
      console.error('Error creating job:', error);
      setError('Failed to create job. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Add New Work</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label htmlFor="createdBy">
              <FaUser /> Who is creating this work?
            </label>
            <select
              id="createdBy"
              name="createdBy"
              value={formData.createdBy}
              onChange={handleChange}
              className={styles.formSelect}
            >
              <option value="">Select creator...</option>
              {CREATORS.map(creator => (
                <option key={creator} value={creator}>
                  {creator}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="workerName">
              <FaUser /> Name of Worker
            </label>
            <input
              type="text"
              id="workerName"
              name="workerName"
              value={formData.workerName}
              onChange={handleChange}
              className={styles.formInput}
              placeholder="Enter worker name"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="workType">
              <FaBriefcase /> Type of Work
            </label>
            <select
              id="workType"
              name="workType"
              value={formData.workType}
              onChange={handleChange}
              className={styles.formSelect}
            >
              <option value="">Select work type...</option>
              {WORK_TYPES.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              className={`${styles.btn} ${styles.btnCancel}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnSubmit}`}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Work'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

