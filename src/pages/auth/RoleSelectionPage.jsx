import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Info } from 'lucide-react';
import logo from '../../assets/logo.png';
import customerIcon from '../../assets/customer.svg';
import housekeepingIcon from '../../assets/Cleaning.png';
import { Button, RadioCard } from '../../components';

const RoleSelectionPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedProviderRole, setSelectedProviderRole] = useState(null);
  const [isNDISParticipant, setIsNDISParticipant] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const navigate = useNavigate();

  const roleOptions = [
    {
      id: 'Customer',
      title: "I'm Customer",
      subtitle: "Looking for Services",
      icon: customerIcon
    },
    {
      id: 'Service Provider',
      title: "I'm Service Provider",
      subtitle: "Looking for Jobs",
      icon: housekeepingIcon
    }
  ];

  const providerRoleOptions = useMemo(
    () => [
      'Student Cleaner',
      'Professional Cleaner',
      'Support Service Provider (NDIS)',
      'Pet Sitter',
      'Housekeeper'
    ],
    []
  );

  // Map display name to backend role value
  const roleDisplayToBackend = {
    'Support Service Provider (NDIS)': 'NDIS Assistant'
  };

  const handleContinue = () => {
    // For Customer, no specific role needed
    if (selectedRole === 'Customer') {
      const params = new URLSearchParams({
        role: 'Customer',
        ndis: isNDISParticipant ? 'true' : 'false'
      });
      navigate(`/signup?${params.toString()}`);
      return;
    }

    // For Service Provider, specific role is required
    if (selectedRole === 'Service Provider') {
      if (!selectedProviderRole) {
        return;
      }
      // Map display name to backend role value if needed
      const backendRole = roleDisplayToBackend[selectedProviderRole] || selectedProviderRole;
      const params = new URLSearchParams({
        role: backendRole,
        ndis: isNDISParticipant ? 'true' : 'false'
      });
      navigate(`/signup?${params.toString()}`);
      return;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-4 sm:p-6">
      {/* Header */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <img src={logo} alt="Aussie Mate" className="h-12 sm:h-16 w-auto" />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center max-w-2xl w-full mx-auto">
        <div className="w-full space-y-6">
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 text-center mb-8">
            Tell us how you'll use the platform.
          </h1>

          {/* Role Selection Cards */}
          <div className="space-y-4">
            {roleOptions.map((role) => (
              <RadioCard
                key={role.id}
                id={role.id}
                title={role.title}
                subtitle={role.subtitle}
                icon={role.icon}
                selected={selectedRole === role.id}
                onSelect={setSelectedRole}
              />
            ))}
          </div>

          {/* Service Provider Role Selection Dropdown */}
          {selectedRole === 'Service Provider' && (
            <div className="relative mt-6 ">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select your cleaner role
              </label>
              <div
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none transition-all duration-200 cursor-pointer bg-white flex items-center justify-between"
              >
                <span className={selectedProviderRole ? 'text-gray-900' : 'text-gray-500'}>
                  {selectedProviderRole || 'Select your cleaner role'}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                    showRoleDropdown ? 'rotate-180' : ''
                  }`}
                />
              </div>

              {/* Dropdown Options */}
              {showRoleDropdown && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {providerRoleOptions.map((role, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSelectedProviderRole(role);
                        setShowRoleDropdown(false);
                      }}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl text-sm"
                    >
                      <span className="text-gray-900">{role}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedRole === 'Service Provider' && selectedProviderRole === 'Student Cleaner' && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
                <Info className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-amber-700">Student work limits</h3>
                <p className="mt-1 text-sm text-amber-600">
                  As a Student Cleaner you’re permitted to work up to 24 hours per week in line with Australian visa
                  regulations. Please plan your availability accordingly.
                </p>
              </div>
            </div>
          )}

          {/* NDIS Participant Toggle - Only show for Customer */}
          {selectedRole === 'Customer' && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl mt-6 shadow-custom">
              <span className="text-gray-900 font-semibold text-base sm:text-lg">
                NDIS Participant
              </span>
              <button
                type="button"
                onClick={() => setIsNDISParticipant(!isNDISParticipant)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
                  isNDISParticipant ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={isNDISParticipant}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    isNDISParticipant ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Continue Button */}
          <div className="pt-4 flex justify-end">
            <Button
              onClick={handleContinue}
              disabled={
                !selectedRole || 
                (selectedRole === 'Service Provider' && !selectedProviderRole)
              }
              size="lg"
              className={`${
                !selectedRole || (selectedRole === 'Service Provider' && !selectedProviderRole)
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
            >
              Continue For Profile Setup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;

