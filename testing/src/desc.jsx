import React, { useState, useEffect } from 'react';

function ProjectEntries() {
  const [projectName, setProjectName] = useState('');
  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [cropDetails, setCropDetails] = useState(null);
  const [error, setError] = useState('');

  // Handle input change
  const handleInputChange = (e) => {
    setProjectName(e.target.value);
  };

  // Fetch entries by project name
  const handleFetchEntries = async () => {
    if (!projectName) {
      setStatus('Please enter a project name!');
      return;
    }

    setStatus('Fetching entries...');
    try {
      const response = await fetch(`http://127.0.0.1:5000/get-project-entries?project_name=${projectName}`);
      const data = await response.json();

      if (response.ok) {
        setEntries(data.entries);
        setStatus(`Found ${data.entries.length} entries for project: "${projectName}"`);
      } else {
        setEntries([]);
        setStatus(data.message || 'Failed to fetch entries.');
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
      setStatus('An error occurred while fetching entries.');
    }
  };

  // Handle click event for crop tiles
  const handleCropClick = (crop) => {
    setSelectedCrop(crop);
    fetch(`http://127.0.0.1:5000/get-crop-details?crop_name=${crop}`)
      .then(response => response.json())
      .then(data => {
        if (data.name) {
          setCropDetails(data);
          setError('');
        } else {
          setCropDetails(null);
          setError('Crop details not found');
        }
      })
      .catch(err => {
        console.error('Error fetching crop details:', err);
        setCropDetails(null);
        setError('Failed to fetch crop details');
      });
  };

  return (
    <div className="container">
      <h2>🔍 Search Project Entries</h2>
      <div className="input-box">
        <input
          type="text"
          placeholder="Enter Project Name"
          value={projectName}
          onChange={handleInputChange}
          className="project-input"
        />
        <button className="fetch-btn" onClick={handleFetchEntries}>Fetch Entries</button>
      </div>

      <p className="status">{status}</p>

      {entries.length > 0 && (
        <div className="entries-table">
          {entries.map((entry, index) => (
            <div key={index}>
              <h3>Project: {entry.project_name}</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {entry.selected_crops.map((crop, idx) => (
                  <div
                    key={idx}
                    className="crop-tile"
                    onClick={() => handleCropClick(crop)}
                    style={{
                      padding: '10px',
                      border: '1px solid #007BFF',
                      borderRadius: '5px',
                      backgroundColor: '#e6f7ff',
                      cursor: 'pointer',
                    }}
                  >
                    {crop}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCrop && (
        <div className="crop-details" style={{ marginTop: '20px', padding: '20px', border: '1px solid #333', borderRadius: '10px' }}>
          {cropDetails ? (
            <div>
              <h3>🌱 Crop Details: {cropDetails.name}</h3>
              <p><strong>Soil Requirements:</strong> {cropDetails.soil}</p>
              <p><strong>Planting Instructions:</strong> {cropDetails.planting}</p>
              <p><strong>Growth Timeline:</strong> {cropDetails.timeline}</p>
              <p><strong>Fertilizers:</strong> {cropDetails.fertilizers}</p>
              <p><strong>Harvesting:</strong> {cropDetails.harvesting}</p>
              <p><strong>Fertilizer Schedule:</strong> {cropDetails.fertilizer_schedule}</p>
              <p><strong>Pest Control Tips:</strong> {cropDetails.pest_control}</p>
            </div>
          ) : (
            <p>{error || 'Loading crop details...'}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ProjectEntries;
