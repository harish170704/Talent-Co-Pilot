import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import data from '../data.json';

import DashboardView from './views/DashboardView';
import ProjectsView from './views/ProjectsView';
import PeopleView from './views/PeopleView';
import UserProfileView from './views/UserProfileView';
import TrainingView from './views/TrainingView';
import ProjectModal from './modals/ProjectModal';
import PersonModal from './modals/PersonModal';

const MainPage = () => {
  // Page state
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState(null);

  // Project state
  const [projects, setProjects] = useState([]);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  
  // User state
  const [users, setUsers] = useState([]);
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Load data on initial render
  useEffect(() => {
    const loadData = () => {
      try {
        const storedProjects = localStorage.getItem('projects');
        const storedUsers = localStorage.getItem('users');
        
        if (storedProjects && storedUsers) {
          const parsedProjects = JSON.parse(storedProjects);
          const typedProjects = parsedProjects.map(project => ({
            ...project,
            phases: project.phases?.map(phase => ({
              ...phase,
              status: (phase.status === 'Completed' ? 'Completed' : 'To Do')
            }))
          }));

          setProjects(typedProjects);
          setUsers(JSON.parse(storedUsers));
        } else {
          const typedProjects = data.projects.map(project => ({
            ...project,
            phases: project.phases?.map(phase => ({
              ...phase,
              status: phase.status === 'Completed' ? 'Completed' : 'To Do'
            }))
          }));
          setProjects(typedProjects);
          setUsers(data.users);
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
        setProjects([]);
        setUsers([]);
      }
    };
    
    loadData();
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (projects.length > 0) {
        localStorage.setItem('projects', JSON.stringify(projects));
    }
  }, [projects]);

  // Save users to localStorage whenever they change
  useEffect(() => {
     if (users.length > 0) {
        localStorage.setItem('users', JSON.stringify(users));
     }
  }, [users]);

  const generateProjectPhases = async (project) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
        Based on the project named "${project.name}" with the description "${project.description}", 
        please generate a list of logical project phases. Each phase should be an object with a 'name', 
        a 'description', and a 'status' which should be set to 'To Do'.
        Provide the output as a JSON array of these objects.
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            status: { type: Type.STRING },
                        },
                        required: ['name', 'description', 'status'],
                    },
                },
            },
        });

        const resultText = response.text.trim();
        const parsedPhases = JSON.parse(resultText);

        const generatedPhases = (Array.isArray(parsedPhases) ? parsedPhases : []).map((phase) => ({
            name: phase.name,
            description: phase.description,
            id: `phase-${Date.now()}-${Math.random()}`,
            status: 'To Do',
        }));

        setProjects(prevProjects =>
            prevProjects.map(p =>
                p.id === project.id ? { ...p, phases: generatedPhases } : p
            )
        );
    } catch (error) {
        console.error("Failed to generate project phases:", error);
    }
  };
  
  const handleAddProjectClick = () => {
    setCurrentProject({ name: '', description: '', status: 'Not Started', skills: [], assignedTo: [], phases: [] });
    setIsProjectModalOpen(true);
  };

  const handleEditProjectClick = (project) => {
    setCurrentProject(project);
    setIsProjectModalOpen(true);
  };
  
  const handleDeleteProject = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(p => p.id !== projectId));
    }
  };

  const handleSaveProject = (projectToSave) => {
    if (projectToSave.id) {
      setProjects(projects.map(p => p.id === projectToSave.id ? projectToSave : p));
    } else {
      const newProject = {
        ...projectToSave,
        id: new Date().toISOString(),
      };
      setProjects(prevProjects => [...prevProjects, newProject]);
      generateProjectPhases(newProject);
    }
    setIsProjectModalOpen(false);
  };
  
  const handleAddPersonClick = () => {
    setCurrentUser({ name: '', role: '', skills: [], experience: 0, interests: [] });
    setIsPersonModalOpen(true);
  };

  const handleEditUserClick = (user) => {
    setCurrentUser(user);
    setIsPersonModalOpen(true);
  };

  const handleSavePerson = (userToSave) => {
    if (currentUser?.id) { // Editing existing user
        setUsers(users.map(u => u.id === userToSave.id ? userToSave : u));
        if (selectedUser?.id === userToSave.id) {
            setSelectedUser(userToSave);
        }
    } else { // Adding new user
        setUsers([...users, userToSave]);
    }
    
    setIsPersonModalOpen(false);
  };
  
  const getNavLinkClass = (view) => {
    const base = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300";
    if (activeView === view) {
      return `${base} bg-slate-600 text-white`;
    }
    return `${base} text-slate-200 hover:bg-slate-700 hover:text-white`;
  };

  const renderContent = () => {
    if (selectedUser) {
        return <UserProfileView 
                    user={selectedUser} 
                    projects={projects} 
                    onBack={() => setSelectedUser(null)} 
                    onEdit={handleEditUserClick} 
                />
    }

    switch (activeView) {
      case 'dashboard': 
        return <DashboardView projects={projects} users={users} />;
      case 'people':
        return <PeopleView 
                    users={users} 
                    projects={projects}
                    onSelectUser={setSelectedUser}
                    onAddUser={handleAddPersonClick}
                />;
      case 'training':
        return <TrainingView />;
      case 'projects':
      default:
        return <ProjectsView 
                    projects={projects} 
                    users={users}
                    onAddProject={handleAddProjectClick}
                    onEditProject={handleEditProjectClick}
                    onDeleteProject={handleDeleteProject}
                />;
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col font-sans text-gray-700 bg-gray-50">
      <header className="w-full bg-gradient-to-r from-slate-700 to-slate-900 shadow-lg sticky top-0 z-10">
        <nav className="flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <span className="text-xl font-semibold text-white">Talent Co-Pilot</span>
          <ul className="flex items-center space-x-2 md:space-x-4">
            <li><button onClick={() => { setActiveView('dashboard'); setSelectedUser(null); }} className={getNavLinkClass('dashboard')}>Dashboard</button></li>
            <li><button onClick={() => { setActiveView('projects'); setSelectedUser(null); }} className={getNavLinkClass('projects')}>Projects</button></li>
            <li><button onClick={() => { setActiveView('people'); setSelectedUser(null); }} className={getNavLinkClass('people')}>People</button></li>
            <li><button onClick={() => { setActiveView('training'); setSelectedUser(null); }} className={getNavLinkClass('training')}>Training</button></li>
          </ul>
        </nav>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
      
      <PersonModal
        isOpen={isPersonModalOpen}
        onClose={() => setIsPersonModalOpen(false)}
        onSave={handleSavePerson}
        user={currentUser}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProject}
        project={currentProject}
        users={users}
       />
    </div>
  );
};

export default MainPage;