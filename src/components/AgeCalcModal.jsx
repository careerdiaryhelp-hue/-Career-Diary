import React, { useState } from 'react';
import { X, Calculator, RotateCw } from 'lucide-react';

export default function AgeCalcModal({ isOpen, onClose }) {
  const [dob, setDob] = useState('');
  const [cutoffDate, setCutoffDate] = useState(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleCalculate = () => {
    if (!dob || !cutoffDate) {
      alert('Please select both Date of Birth and Cut-off date.');
      return;
    }

    const dobObj = new Date(dob);
    const cutoffObj = new Date(cutoffDate);

    if (dobObj > cutoffObj) {
      alert('Date of Birth cannot be after Cut-off date.');
      return;
    }

    let years = cutoffObj.getFullYear() - dobObj.getFullYear();
    let months = cutoffObj.getMonth() - dobObj.getMonth();
    let days = cutoffObj.getDate() - dobObj.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(cutoffObj.getFullYear(), cutoffObj.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    setResult(`${years} Years, ${months} Months, ${days} Days`);
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>

        <div className="modal-header">
          <h2><Calculator className="w-5 h-5 inline mr-2 text-primary" /> Govt Job Age Calculator</h2>
          <p>Calculate your exact age in years, months, and days for job eligibility cut-off date.</p>
        </div>

        <div className="calc-form">
          <div className="form-group">
            <label>Your Date of Birth (DOB) *</label>
            <input
              type="date"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Cut-Off / Calculation Date *</label>
            <input
              type="date"
              required
              value={cutoffDate}
              onChange={(e) => setCutoffDate(e.target.value)}
            />
          </div>

          <button className="btn btn-primary btn-block" onClick={handleCalculate}>
            <RotateCw className="w-4 h-4 mr-1" /> Calculate Age
          </button>

          {result && (
            <div className="calc-result">
              <h4>Calculated Age Result:</h4>
              <div className="age-display">{result}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
