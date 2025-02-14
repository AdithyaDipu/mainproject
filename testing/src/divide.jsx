import React from 'react';
import './ProjectSelection.css'
function ProjectSelection() {
  const handleNewProject = () => {
    alert('Create New Project button clicked');
  };

  const handleExistingProject = () => {
    alert('Existing Project button clicked');
  };

  return (
    <div className="project-selection-container">
      <h1 className="project-selection-title">🌱 AgroAssist Project Selection 🌿</h1>
      <div className="button-group">
        <button className="project-button new-project" onClick={handleNewProject}>Create New Project</button>
        <button className="project-button existing-project" onClick={handleExistingProject}>Existing Project</button>
      </div>
    </div>
  );
}

export default ProjectSelection;
