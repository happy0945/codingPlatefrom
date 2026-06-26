// generate a code for admin update page according to the admin options in the admin page
import React, { useState } from 'react';
import { Edit } from 'lucide-react';
import { NavLink } from 'react-router';

function AdminUpdate() {
  const [selectedOption, setSelectedOption] = useState(null);

  const adminOptions = [
    {
      id: 'update',
      title: 'Update Problem',
      description: 'Edit existing problems and their details',
      icon: Edit,
      color: 'btn-warning',
      bgColor: 'bg-warning/10',
      route: '/admin/update'
    }
  ];

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-base-content mb-4">
            Admin Update Panel
          </h1>
          <p className="text-base-content/70 text-lg">
            Manage coding problems on your platform
          </p>
        </div>

        {/* Admin Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {adminOptions.map((option) => (
            <NavLink
              key={option.id}
              to={option.route}
              className={`card p-6 shadow-lg rounded-lg transition-transform transform hover:scale-105 ${option.bgColor}`}
            >
              <div className="flex items-center mb-4">
                <option.icon className={`w-8 h-8 ${option.color}`} />
                <h2 className="text-xl font-semibold ml-4">{option.title}</h2>
              </div>
              <p className="text-base-content/70">{option.description}</p>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminUpdate;