import React, { useState, useEffect } from 'react';

const PersonModal = ({ isOpen, onClose, onSave, user }) => {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        setCurrentUser(user);
    }, [user]);

    if (!isOpen || !currentUser) {
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!currentUser?.name || !currentUser?.role || currentUser.experience === undefined) {
            alert("Please fill all required fields.");
            return;
        }

        const userToSave = {
            id: currentUser.id || new Date().toISOString(),
            name: currentUser.name,
            role: currentUser.role,
            skills: currentUser.skills || [],
            experience: currentUser.experience,
            interests: currentUser.interests || [],
        };
        onSave(userToSave);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">{currentUser.id ? 'Edit Person' : 'Add New Person'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="personName" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" id="personName" value={currentUser.name || ''} onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" required />
                        </div>
                        <div>
                            <label htmlFor="personRole" className="block text-sm font-medium text-gray-700">Role</label>
                            <input type="text" id="personRole" value={currentUser.role || ''} onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" required />
                        </div>
                        <div>
                            <label htmlFor="personExperience" className="block text-sm font-medium text-gray-700">Years of Experience</label>
                            <input type="number" id="personExperience" value={currentUser.experience ?? ''} onChange={(e) => setCurrentUser({ ...currentUser, experience: Number(e.target.value) })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" required min="0" />
                        </div>
                        <div>
                            <label htmlFor="personSkills" className="block text-sm font-medium text-gray-700">Skills (comma-separated)</label>
                            <input type="text" id="personSkills" value={Array.isArray(currentUser.skills) ? currentUser.skills.join(', ') : ''} onChange={(e) => setCurrentUser({ ...currentUser, skills: e.target.value.split(',').map(s => s.trim()) })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" placeholder="e.g. React, Python, Figma" />
                        </div>
                        <div>
                            <label htmlFor="personInterests" className="block text-sm font-medium text-gray-700">Interests (comma-separated)</label>
                            <input type="text" id="personInterests" value={Array.isArray(currentUser.interests) ? currentUser.interests.join(', ') : ''} onChange={(e) => setCurrentUser({ ...currentUser, interests: e.target.value.split(',').map(s => s.trim()) })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" placeholder="e.g. UX Design, DevOps" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-md shadow-sm hover:bg-gray-900">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PersonModal;