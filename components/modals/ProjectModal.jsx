import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";

// Training resources
const trainingLinks = {
    'React': 'https://www.youtube.com/watch?v=bMknfKXIFA8', 'TypeScript': 'https://www.youtube.com/watch?v=d56mG7DezGs', 'CSS': 'https://www.youtube.com/watch?v=OEV8gHsKqA4', 'HTML': 'https://www.youtube.com/watch?v=kUMe1FH4CHE', 'JavaScript': 'https://www.youtube.com/watch?v=PkZNo7MFNFg', 'Node.js': 'https://www.youtube.com/watch?v=f2EqECiTBL8', 'Python': 'https://www.youtube.com/watch?v=rfscVS0vtbw', 'PostgreSQL': 'https://www.youtube.com/watch?v=hV-yMgxI_0c', 'Docker': 'https://www.youtube.com/watch?v=p28piYY_j7Y', 'Figma': 'https://www.youtube.com/watch?v=3q3FV65JDBg', 'Sketch': 'https://www.youtube.com/watch?v=nF0y_n-u5F0', 'Adobe XD': 'https://www.youtube.com/watch?v=68w2V4z4v0g', 'User Research': 'https://www.youtube.com/watch?v=Lg9t8-0-i4w', 'Agile': 'https://www.youtube.com/watch?v=Z9QbYZh1YXY', 'Scrum': 'https://www.youtube.com/watch?v=s4thQv4_tG4', 'Jira': 'https://www.youtube.com/watch?v=pWAg6444-pY', 'Communication': 'https://www.youtube.com/watch?v=I6IAhXM-v2U', 'AWS': 'https://www.youtube.com/watch?v=k1RI58r2Aso', 'Kubernetes': 'https://www.youtube.com/watch?v=X48VuDVv0do', 'Terraform': 'https://www.youtube.com/watch?v=SLB_c_ayRMo', 'CI/CD': 'https://www.youtube.com/watch?v=62N8UiWUd_A', 'DevOps': 'https://www.youtube.com/watch?v=hQcFE0I-i0Q', 'Selenium': 'https://www.youtube.com/watch?v=U6_Sj_6-m_Q', 'Cypress': 'https://www.youtube.com/watch?v=LcGCRZZox4o', 'Jest': 'https://www.youtube.com/watch?v=3e1GH4i_pYE', 'Performance Testing': 'https://www.youtube.com/watch?v=zYt34JcEAcw', 'Pandas': 'https://www.youtube.com/watch?v=yzIMOd3Vq-A', 'TensorFlow': 'https://www.youtube.com/watch?v=KNAWp2S3w94', 'SQL': 'https://www.youtube.com/watch?v=HXV3zeQKqGY', 'React Native': 'https://www.youtube.com/watch?v=0-S5a0eXPoc', 'Swift': 'https://www.youtube.com/watch?v=8Xg7E9shq0U', 'Kotlin': 'https://www.youtube.com/watch?v=EExSSotojVI', 'Firebase': 'https://www.youtube.com/watch?v=S1g6h_a7_so', 'Cryptography': 'https://www.youtube.com/watch?v=inWWhr5tnEA', 'Penetration Testing': 'https://www.youtube.com/watch?v=3Kq1MIfTz5o', 'Network Security': 'https://www.youtube.com/watch?v=ASg5-xG85-U', 'MongoDB': 'https://www.youtube.com/watch?v=c2M-rlkkT5o', 'GraphQL': 'https://www.youtube.com/watch?v=ed8SzALpx1Q', 'SEO': 'https://www.youtube.com/watch?v=xsVTqzratPs', 'Content Marketing': 'https://www.youtube.com/watch?v=v8C_T58iPK0', 'Google Analytics': 'https://www.youtube.com/watch?v=t0hL-p4RVbE', 'UX Design': 'https://www.youtube.com/watch?v=c9H31gQj_U', 'Git': 'https://www.youtube.com/watch?v=RGOj5yH7evk',
};

const ProjectModal = ({ isOpen, onClose, onSave, project, users }) => {
    const [currentProject, setCurrentProject] = useState(null);
    const [predictionResults, setPredictionResults] = useState(null);
    const [isPredicting, setIsPredicting] = useState(false);
    const [numPeopleToFind, setNumPeopleToFind] = useState(3);
    const [predictionError, setPredictionError] = useState(null);
    const [documentImage, setDocumentImage] = useState(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractionError, setExtractionError] = useState(null);

    useEffect(() => {
        setCurrentProject(project);
        // Reset modal-specific state when project changes
        if(project) {
            setPredictionResults(null);
            setPredictionError(null);
            setIsPredicting(false);
            setDocumentImage(null);
            setIsExtracting(false);
            setExtractionError(null);
        }
    }, [project]);
    
    if (!isOpen || !currentProject) {
        return null;
    }

    const handleSaveProject = (e) => {
        e.preventDefault();
        if (!currentProject?.name || !currentProject?.description || !currentProject.status) {
            alert("Please fill all fields.");
            return;
        }

        const projectToSave = {
            ...currentProject,
            skills: currentProject.skills?.filter(s => s.trim() !== '') || [],
            assignedTo: currentProject.assignedTo || [],
            phases: currentProject.phases || []
        };
        onSave(projectToSave);
    };

    const handleStatusChange = (newStatus) => {
        const updatedProject = { ...currentProject, status: newStatus };
        if (newStatus === 'In Progress' && !updatedProject.startDate) {
            updatedProject.startDate = new Date().toISOString();
        }
        if (newStatus === 'Completed' && !updatedProject.endDate) {
            updatedProject.endDate = new Date().toISOString();
            if (!updatedProject.startDate) {
                updatedProject.startDate = new Date().toISOString();
            }
        }
        setCurrentProject(updatedProject);
    };

    const handleFileChange = (e) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setDocumentImage(file);
          setExtractionError(null);
      }
    };

    const handleExtractFromDocument = async () => {
        if (!documentImage) return;
        setIsExtracting(true);
        setExtractionError(null);

        const reader = new FileReader();
        reader.readAsDataURL(documentImage);
        reader.onload = async () => {
            const base64Data = (reader.result).split(',')[1];
            const mimeType = documentImage.type;
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const filePart = { inlineData: { mimeType, data: base64Data } };
            const textPart = { text: `Analyze the attached project document. Extract the project name, a concise project description, and a list of required technical and soft skills. Provide the output in a JSON object with keys: 'projectName', 'projectDescription', and 'projectSkills' (as an array of strings).` };

            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: { parts: [filePart, textPart] },
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                projectName: { type: Type.STRING },
                                projectDescription: { type: Type.STRING },
                                projectSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                            },
                            required: ['projectName', 'projectDescription', 'projectSkills'],
                        }
                    }
                });
                
                const resultText = response.text.trim();
                const extractedData = JSON.parse(resultText);

                setCurrentProject(prev => ({
                    ...prev,
                    name: extractedData.projectName || prev?.name,
                    description: extractedData.projectDescription || prev?.description,
                    skills: extractedData.projectSkills || prev?.skills,
                }));
            } catch (error) {
                setExtractionError("Failed to extract details.");
            } finally {
                setIsExtracting(false);
            }
        };
        reader.onerror = () => {
            setExtractionError("Failed to read the file.");
            setIsExtracting(false);
        };
    };

    const handleFindMatches = async () => {
        if (!currentProject?.description || !currentProject?.skills || currentProject.skills.length === 0) {
            setPredictionError("Please provide a description and skills.");
            return;
        }
        setIsPredicting(true);
        setPredictionError(null);
        setPredictionResults(null);
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const userProfiles = users.map(u => `User ID: ${u.id}, Name: ${u.name}, Role: ${u.role}, Experience: ${u.experience} years, Skills: ${u.skills.join(', ')}, Interests: ${u.interests.join(', ')}`).join('\n');
        const prompt = `Project: "${currentProject.name}", Desc: "${currentProject.description}", Skills: ${currentProject.skills.join(', ')}\nUsers:\n${userProfiles}\nAnalyze users for the project. For 'matchPercentage', consider skills, experience, and role. For 'trainingRecommendations', prioritize users whose 'Interests' match the 'missingSkills'. Provide a JSON response with 'bestMatches' (top ${numPeopleToFind} users with userId, matchPercentage, justification, missingSkills) and 'trainingRecommendations' (users with userId, missingSkills, and reason).`;

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash", contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            bestMatches: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { userId: { type: Type.STRING }, matchPercentage: { type: Type.NUMBER }, justification: { type: Type.STRING }, missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['userId', 'matchPercentage', 'justification', 'missingSkills'] } },
                            trainingRecommendations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { userId: { type: Type.STRING }, missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } }, reason: { type: Type.STRING } }, required: ['userId', 'missingSkills', 'reason'] } }
                        },
                        required: ['bestMatches', 'trainingRecommendations'],
                    },
                },
            });
            setPredictionResults(JSON.parse(response.text.trim()));
        } catch (error) {
            setPredictionError("Failed to get AI predictions.");
        } finally {
            setIsPredicting(false);
        }
    };
    
    const handleAssignUserToggle = (userId) => {
        const currentAssigned = currentProject.assignedTo || [];
        const newAssigned = currentAssigned.includes(userId) ? currentAssigned.filter(id => id !== userId) : [...currentAssigned, userId];
        setCurrentProject({ ...currentProject, assignedTo: newAssigned });
    };

    const handleSelectRecommendedUser = (userId) => {
        const currentAssigned = currentProject.assignedTo || [];
        if (!currentAssigned.includes(userId)) {
            setCurrentProject({ ...currentProject, assignedTo: [...currentAssigned, userId] });
        }
    };
    
    const handlePhaseChange = (phaseId, field, value) => {
        const updatedPhases = currentProject.phases?.map(phase =>
            phase.id === phaseId ? { ...phase, [field]: value } : phase
        );
        setCurrentProject({ ...currentProject, phases: updatedPhases });
    };

    const handlePhaseStatusToggle = (phaseId) => {
        const updatedPhases = currentProject.phases?.map(phase =>
            phase.id === phaseId ? { ...phase, status: (phase.status === 'To Do' ? 'Completed' : 'To Do') } : phase
        );
        setCurrentProject({ ...currentProject, phases: updatedPhases });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
                <h3 className="text-xl font-medium leading-6 text-gray-900 mb-6">{currentProject.id ? 'Edit Project' : 'Add New Project'}</h3>
                <form onSubmit={handleSaveProject}>
                    <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-4">
                        <div className="border-b border-gray-200 pb-5 mb-5">
                            <h4 className="text-md font-semibold text-gray-800 mb-3">📄 Auto-fill from File</h4>
                            <p className="text-xs text-gray-500 mb-3">Upload a project brief (Image, PDF, or Word document) to let the AI fill in the details below. This is optional.</p>
                            <div className="flex items-center space-x-3">
                                <label htmlFor="doc-upload" className="cursor-pointer px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 text-sm">Choose File</label>
                                <input id="doc-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf,.doc,.docx" />
                                {documentImage && <span className="text-sm text-gray-600 truncate">{documentImage.name}</span>}
                                <button type="button" onClick={handleExtractFromDocument} disabled={!documentImage || isExtracting} className="ml-auto px-4 py-2 bg-gray-600 text-white font-semibold rounded-md shadow-sm hover:bg-gray-700 disabled:bg-gray-300">
                                    {isExtracting ? 'Extracting...' : 'Extract Details'}
                                </button>
                            </div>
                            {isExtracting && <div className="text-center p-4"> <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-700 mx-auto"></div> <p className="mt-2 text-sm text-gray-500">Reading document...</p></div>}
                            {extractionError && <div className="mt-3 p-2 bg-red-100 text-red-800 rounded-md text-sm">{extractionError}</div>}
                        </div>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Project Name</label>
                            <input type="text" id="name" value={currentProject.name || ''} onChange={(e) => setCurrentProject({ ...currentProject, name: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" required />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea id="description" rows={3} value={currentProject.description || ''} onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" required></textarea>
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                            <select id="status" value={currentProject.status || 'Not Started'} onChange={(e) => handleStatusChange(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md" required>
                                <option>Not Started</option><option>In Progress</option><option>Completed</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Required Skills (comma-separated)</label>
                            <input type="text" id="skills" value={Array.isArray(currentProject.skills) ? currentProject.skills.join(', ') : ''} onChange={(e) => setCurrentProject({ ...currentProject, skills: e.target.value.split(',').map(s => s.trim()) })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" placeholder="e.g. React, Node.js, Figma" />
                        </div>

                        {currentProject.phases && currentProject.phases.length > 0 && (
                            <div className="border-t border-gray-200 pt-5">
                                <h4 className="text-md font-semibold text-gray-800 mb-3">Project Phases</h4>
                                <div className="space-y-4">
                                    {currentProject.phases.map(phase => (
                                        <div key={phase.id} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <input type="text" value={phase.name} onChange={(e) => handlePhaseChange(phase.id, 'name', e.target.value)} className="font-semibold text-gray-800 bg-transparent border-none focus:ring-0 w-full" />
                                                <input id={`phase-status-${phase.id}`} type="checkbox" checked={phase.status === 'Completed'} onChange={() => handlePhaseStatusToggle(phase.id)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                            </div>
                                            <textarea value={phase.description} onChange={(e) => handlePhaseChange(phase.id, 'description', e.target.value)} rows={2} className="mt-1 text-sm text-gray-600 bg-transparent border-none focus:ring-0 w-full resize-none" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div className="border-t border-gray-200 pt-5">
                            <h4 className="text-md font-semibold text-gray-800 mb-3">✨ AI Team Recommendations</h4>
                            <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-md">
                                <label htmlFor="numPeople" className="text-sm font-medium text-gray-700">Find top</label>
                                <input type="number" id="numPeople" value={numPeopleToFind} onChange={e => setNumPeopleToFind(Number(e.target.value))} min="1" max="10" className="w-20 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"/>
                                <label htmlFor="numPeople" className="text-sm font-medium text-gray-700">candidates</label>
                                <button type="button" onClick={handleFindMatches} disabled={isPredicting} className="ml-auto px-4 py-2 bg-gray-800 text-white font-semibold rounded-md shadow-sm hover:bg-gray-900 disabled:bg-gray-400">
                                    {isPredicting ? 'Analyzing...' : 'Find Matches'}
                                </button>
                            </div>
                            {isPredicting && <div className="text-center p-6"> <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div> <p className="mt-2 text-sm text-gray-600">AI is thinking...</p></div>}
                            {predictionError && <div className="mt-3 p-3 bg-red-100 text-red-800 rounded-md text-sm">{predictionError}</div>}
                            {predictionResults && (
                                <div className="mt-4 space-y-4">
                                    <div>
                                        <h5 className="text-sm font-semibold text-gray-800 mb-2">Top Matches</h5>
                                        <ul className="space-y-2">
                                            {predictionResults.bestMatches.map(match => {
                                                const user = users.find(u => u.id === match.userId);
                                                if (!user) return null;
                                                return (
                                                    <li key={match.userId} className="p-3 bg-white rounded-md border border-gray-200">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <p className="font-bold text-gray-900">{user.name} <span className="text-sm font-normal text-gray-500">- {user.role}</span></p>
                                                                <p className="text-xs text-gray-600 italic mt-1">"{match.justification}"</p>
                                                            </div>
                                                            <div className="text-right ml-4 flex-shrink-0"><p className="text-lg font-bold text-green-600">{match.matchPercentage}%</p><p className="text-xs text-gray-500">Match</p></div>
                                                        </div>
                                                        {match.missingSkills?.length > 0 && (
                                                            <div className="mt-2 pt-2 border-t border-gray-100">
                                                                <p className="text-xs font-semibold text-gray-700">Missing Skills:</p>
                                                                <div className="flex flex-wrap gap-2 mt-1">
                                                                    {match.missingSkills.map(skill => (
                                                                        <div key={skill} className="flex items-center gap-2 text-xs text-red-700 bg-red-100 px-2 py-1 rounded-full">
                                                                            <span>{skill}</span>
                                                                            {trainingLinks[skill] && (<a href={trainingLinks[skill]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold">Learn</a>)}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        <button type="button" onClick={() => handleSelectRecommendedUser(user.id)} className="mt-3 w-full text-center px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded hover:bg-gray-200">Select {user.name}</button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                    {predictionResults.trainingRecommendations.length > 0 && (
                                        <div>
                                            <h5 className="text-sm font-semibold text-gray-800 mb-2">Further Training Recommendations</h5>
                                            <ul className="space-y-2">
                                                {predictionResults.trainingRecommendations.map(rec => {
                                                    const user = users.find(u => u.id === rec.userId);
                                                    if (!user) return null;
                                                    return (
                                                        <li key={rec.userId} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                                                            <p className="font-bold text-gray-900">{user.name}</p>
                                                            <p className="text-xs text-gray-600 italic mt-1">"{rec.reason}"</p>
                                                            <div className="mt-2 pt-2 border-t border-gray-100">
                                                                <div className="flex flex-wrap gap-2 mt-1">
                                                                    {rec.missingSkills.map(skill => (
                                                                        <div key={skill} className="flex items-center gap-2 text-xs text-red-700 bg-red-100 px-2 py-1 rounded-full">
                                                                            <span>{skill}</span>
                                                                            {trainingLinks[skill] && (<a href={trainingLinks[skill]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold">Learn</a>)}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Assign Team Members</label>
                            <div className="mt-2 border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                                {users.map(user => (
                                    <div key={user.id} className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-gray-50">
                                        <span>{user.name} <span className="text-xs text-gray-500">- {user.role}</span></span>
                                        <input type="checkbox" checked={currentProject.assignedTo?.includes(user.id) || false} onChange={() => handleAssignUserToggle(user.id)} className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end space-x-4 border-t pt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-md shadow-sm hover:bg-gray-900">Save Project</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectModal;