import React from 'react';

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const getStatusBadge = (status) => {
    switch (status) {
        case 'Completed': return 'bg-green-100 text-green-800';
        case 'In Progress': return 'bg-yellow-100 text-yellow-800';
        case 'Not Started': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const UserProfileView = ({ user, projects, onBack, onEdit }) => {
    const statusOrder = { 'In Progress': 1, 'Not Started': 2, 'Completed': 3 };
    const assignedProjects = projects.filter(p => p.assignedTo.includes(user.id));
    const currentProjects = assignedProjects.filter(p => p.status !== 'Completed').sort((a,b) => statusOrder[a.status] - statusOrder[b.status]);
    const pastProjects = assignedProjects.filter(p => p.status === 'Completed');

    const ProjectList = ({ projects }) => (
        <ul className="space-y-3">
            {projects.map(project => (
                <li key={project.id} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-800">{project.name}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(project.status)}`}>{project.status}</span>
                    </div>
                    {project.startDate && (<p className="text-xs text-gray-500 mt-1">{formatDate(project.startDate)} - {project.endDate ? formatDate(project.endDate) : 'Present'}</p>)}
                </li>
            ))}
        </ul>
    );

    return (
        <div>
            <button onClick={onBack} className="mb-6 inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                Back to People
            </button>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                        <p className="text-lg text-gray-500">{user.role}</p>
                    </div>
                    <button onClick={() => onEdit(user)} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md shadow-sm hover:bg-gray-700">
                        Edit Profile
                    </button>
                </div>
                <p className="text-md text-gray-600 mb-6"><strong>{user.experience}</strong> years of experience</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Skills</h2>
                        <div className="flex flex-wrap gap-3 mb-8">
                            {user.skills.map(skill => <span key={skill} className="px-3 py-1 text-sm font-medium rounded-full bg-gray-200 text-gray-800">{skill}</span>)}
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Interests</h2>
                        <div className="flex flex-wrap gap-3">
                            {user.interests?.map(interest => <span key={interest} className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">{interest}</span>)}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Assignments ({currentProjects.length})</h2>
                        {currentProjects.length > 0 ? <ProjectList projects={currentProjects} /> : <p className="text-gray-500">No active projects.</p>}
                        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Completed Projects ({pastProjects.length})</h2>
                        {pastProjects.length > 0 ? <ProjectList projects={pastProjects} /> : <p className="text-gray-500">No completed projects yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileView;