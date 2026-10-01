import React, { useState } from 'react';
import { X, Edit3, UploadCloud } from 'lucide-react';

export default function PostJobModal({ isOpen, onClose, onAddJob }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'LATEST JOB',
    state: '',
    badge: 'New!',
    vacancies: '',
    lastDate: '',
    bannerColor: 'pink',
    description: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    const newJob = {
      id: Date.now(),
      title: formData.title.trim(),
      category: formData.category,
      state: formData.state.trim() || 'All India',
      badge: formData.badge,
      vacancies: formData.vacancies.trim() || 'Various',
      lastDate: formData.lastDate.trim() || 'Soon',
      bannerColor: formData.bannerColor,
      description: formData.description.trim(),
      organization: 'Career Diary Official Alert',
      postName: formData.title.trim(),
      appStart: new Date().toLocaleDateString(),
      feeGen: '₹100',
      feeSc: '₹0',
      minAge: '18 Years',
      maxAge: '37 Years',
      qualification: 'As specified in post'
    };

    onAddJob(newJob);
    onClose();
    setFormData({
      title: '',
      category: 'LATEST JOB',
      state: '',
      badge: 'New!',
      vacancies: '',
      lastDate: '',
      bannerColor: 'pink',
      description: '',
    });
    alert('Job update published successfully to Career Diary!');
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>

        <div className="modal-header">
          <h2><Edit3 className="w-5 h-5 inline mr-2 text-primary" /> Add New Job / Notification Update</h2>
          <p>Post new job alerts, admit cards, or syllabus directly to Career Diary.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. SSC CGL Recruitment 2025 Online Form Apply"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="LATEST JOB">LATEST JOB</option>
                <option value="ADMIT CARD">ADMIT CARD</option>
                <option value="RESULT">RESULT</option>
                <option value="ANSWER KEY">ANSWER KEY</option>
                <option value="SYLLABUS">SYLLABUS</option>
                <option value="ADMISSION">ADMISSION</option>
              </select>
            </div>

            <div className="form-group">
              <label>State / Category Tag *</label>
              <input
                type="text"
                required
                placeholder="e.g. Bihar, SSC, Railway, Central"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status Badge Tag</label>
              <select
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              >
                <option value="New!">New!</option>
                <option value="Out">Out</option>
                <option value="START">START</option>
                <option value="Link Active">Link Active</option>
                <option value="Last Date">Last Date Soon</option>
              </select>
            </div>

            <div className="form-group">
              <label>Total Vacancies</label>
              <input
                type="text"
                placeholder="e.g. 17,727 Posts"
                value={formData.vacancies}
                onChange={(e) => setFormData({ ...formData, vacancies: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Last Date to Apply</label>
              <input
                type="text"
                placeholder="e.g. 25/08/2025"
                value={formData.lastDate}
                onChange={(e) => setFormData({ ...formData, lastDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Banner Color</label>
              <select
                value={formData.bannerColor}
                onChange={(e) => setFormData({ ...formData, bannerColor: e.target.value })}
              >
                <option value="pink">Magenta Pink</option>
                <option value="green">Bright Green</option>
                <option value="orange">Orange Maroon</option>
                <option value="blue">Royal Blue</option>
                <option value="purple">Violet Purple</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Full Description / Details *</label>
            <textarea
              rows="4"
              required
              placeholder="Enter brief overview, eligibility, and steps to apply..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary"><UploadCloud className="w-4 h-4" /> Publish Update</button>
          </div>
        </form>
      </div>
    </div>
  );
}
