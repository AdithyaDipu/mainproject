import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../UserContext';

function ProjectEntries() {
  const { user } = useContext(UserContext);  // Get the logged-in user info
  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [cropDetails, setCropDetails] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProjects = async () => {
      if (!user) return;
      setStatus('Fetching your projects...');
      try {
        const response = await fetch(`http://127.0.0.1:5000/get-user-projects?email=${user.email}`);
        const data = await response.json();

        if (response.ok) {
          setEntries(data.entries);
          setStatus(`Found ${data.entries.length} project(s) under your email.`);
        } else {
          setEntries([]);
          setStatus(data.message || 'No projects found.');
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setStatus('An error occurred while fetching your projects.');
      }
    };

    fetchUserProjects();
  }, [user]);

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
      <h2>🌾 Your Projects</h2>
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
