import React, { useState } from 'react';

const PeopleView = ({ users, projects, onSelectUser, onAddUser }) => {
    const [seniorityFilter, setSeniorityFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [skillFilter, setSkillFilter] = useState('All');

    const allSkills = [...new Set(users.flatMap(user => user.skills))].sort();

    const getSeniorityButtonClass = (level) => {
        const base = "px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 flex-grow text-center";
        return seniorityFilter === level ? `${base} bg-gray-800 text-white shadow-sm` : `${base} bg-white text-gray-700 border border-gray-200 hover:bg-gray-100`;
    };

    const filteredUsers = users.filter(user => 
        (user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.role.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (skillFilter === 'All' || user.skills.includes(skillFilter))
    );

    const experiencedUsers = filteredUsers.filter(user => user.experience >= 6);
    const intermediateUsers = filteredUsers.filter(user => user.experience >= 3 && user.experience < 6);
    const freshers = filteredUsers.filter(user => user.experience < 3);

    const UserCard = ({ user }) => {
        const workload = projects.filter(p => p.status === 'In Progress' && p.assignedTo.includes(user.id)).length;
        return (
            <div onClick={() => onSelectUser(user)} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="flex-grow">
                    <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                    <p className="text-gray-600">{user.role}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium">Active Projects</span>
                    <span className={`font-bold px-2 py-1 rounded-md text-xs ${workload > 2 ? 'bg-red-100 text-red-800' : workload > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {workload}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">People</h1>
                <button onClick={onAddUser} className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-md shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                    + Add Person
                </button>
            </div>
            <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Search by name or role..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" />
                    <select value={skillFilter} onChange={e => setSkillFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm bg-white">
                        <option value="All">Filter by skill...</option>
                        {allSkills.map(skill => <option key={skill} value={skill}>{skill}</option>)}
                    </select>
                </div>
                <div className="flex space-x-2">
                    <button onClick={() => setSeniorityFilter('All')} className={getSeniorityButtonClass('All')}>All</button>
                    <button onClick={() => setSeniorityFilter('Experienced')} className={getSeniorityButtonClass('Experienced')}>Experienced</button>
                    <button onClick={() => setSeniorityFilter('Intermediate')} className={getSeniorityButtonClass('Intermediate')}>Intermediate</button>
                    <button onClick={() => setSeniorityFilter('Freshers')} className={getSeniorityButtonClass('Freshers')}>Freshers</button>
                </div>
            </div>
            {filteredUsers.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg border border-gray-200"><p className="text-gray-500">No people found matching your criteria.</p></div>
            ) : (
                <div className="space-y-12">
                    {(seniorityFilter === 'All' || seniorityFilter === 'Experienced') && experiencedUsers.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Experienced ({experiencedUsers.length})</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{experiencedUsers.map(user => <UserCard key={user.id} user={user} />)}</div>
                        </div>
                    )}
                    {(seniorityFilter === 'All' || seniorityFilter === 'Intermediate') && intermediateUsers.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Intermediate ({intermediateUsers.length})</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{intermediateUsers.map(user => <UserCard key={user.id} user={user} />)}</div>
                        </div>
                    )}
                    {(seniorityFilter === 'All' || seniorityFilter === 'Freshers') && freshers.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Freshers ({freshers.length})</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{freshers.map(user => <UserCard key={user.id} user={user} />)}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PeopleView;