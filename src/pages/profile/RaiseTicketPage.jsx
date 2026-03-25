import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PageHeader,
  Button,
  Loader,
  CustomSelect,
  FileUploadArea,
} from "../../components";
import { ChevronDown, CheckCircle } from "lucide-react";

const RaiseTicketPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    countryCode: "+61",
    phoneNumber: "",
    role: "",
    category: "",
    projectName: "",
    description: "",
    screenshot: null,
  });

  const roles = [
    { label: "Customer", value: "Customer" },
    { label: "Cleaner", value: "Cleaner" },
  ];
  const categories = [
    { label: "Booking Issue", value: "Booking Issue" },
    { label: "Payment Issue", value: "Payment Issue" },
    { label: "Profile Update", value: "Profile Update" },
    { label: "Technical Bug", value: "Technical Bug" },
    { label: "Other", value: "Other" },
  ];
  // const projects = [
  //   { label: "Regular Cleaning", value: "Regular Cleaning" },
  //   { label: "Bond Cleaning", value: "Bond Cleaning" },
  //   { label: "Oven Cleaning", value: "Oven Cleaning" },
  //   { label: "End of Lease", value: "End of Lease" },
  // ];
  const countryCodes = [
    { label: "+91", value: "+91" },
    { label: "+61", value: "+61" },
  ];

  const handleBack = () => {
    navigate("/my-tickets");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleValueChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fieldName = "screenshot") => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: {
          file,
          name: file.name,
          preview: URL.createObjectURL(file),
          fileType: file.type,
        },
      }));
    }
  };

  const handleRemoveFile = (fieldName) => {
    setFormData((prev) => ({ ...prev, [fieldName]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API submission
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate("/my-tickets"), 2000);
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-[48px] p-12 shadow-2xl shadow-primary-500/10 border border-gray-100 max-w-sm w-full text-center">
          <div className="w-24 h-24 bg-green-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-green-100 shadow-sm">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 mb-3 uppercase tracking-tighter">
            SUCCESS!
          </h3>
          <p className="text-gray-400 font-bold text-sm leading-relaxed">
            Your support ticket has been raised. Redirecting to your tickets
            list...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <PageHeader
          title="Raise Support Ticket"
          onBack={handleBack}
          className="mb-5"
        />

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="space-y-3 mb-3">
            <label className="text-base font-medium text-gray-900">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter your name"
              className="mt-1 w-full rounded-xl !rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-primary-500 focus:border-primary-500 focus:outline-none"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-3 mb-3">
            <label className="text-base font-medium text-gray-900">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <div className="w-32">
                <CustomSelect
                  options={countryCodes}
                  value={formData.countryCode}
                  onChange={(val) => handleValueChange("countryCode", val)}
                  placeholder="+61"
                />
              </div>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => {
                  let value = e.target.value;

                  // Remove non-digit characters
                  value = value.replace(/\D/g, "");

                  // Limit to 10 digits
                  if (value.length > 10) return;

                  handleInputChange({
                    target: {
                      name: "phoneNumber",
                      value,
                    },
                  });
                }}
                required
                placeholder="Enter phone number"
                maxLength={10}
                className="flex-1 mt-1 rounded-xl !rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-primary-500 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Grid for Role and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mb-3">
            <div className="space-y-3">
              <label className="text-base font-medium text-gray-900">
                Role <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                options={roles}
                value={formData.role}
                onChange={(val) => handleValueChange("role", val)}
                placeholder="Select Your Role"
              />
            </div>

            <div className="space-y-3">
              <label className="text-base font-medium text-gray-900">
                Issue Category <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                options={categories}
                value={formData.category}
                onChange={(val) => handleValueChange("category", val)}
                placeholder="Select Issue Category"
              />
            </div>
          </div>

          {/* Project Name */}
          {/* <div className="space-y-3 mb-3">
            <label className="text-xs font-medium text-gray-900 px-2">
              Project Name <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              options={projects}
              value={formData.projectName}
              onChange={(val) => handleValueChange("projectName", val)}
              placeholder="Select Project"
            />
          </div> */}

          {/* Description */}
          <div className="space-y-3 mb-3">
            <label className="text-base font-medium text-gray-900">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              placeholder="Describe your issue in detail..."
              className="mt-1 w-full rounded-xl !rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-primary-500 focus:border-primary-500 focus:outline-none"
            />
          </div>

          {/* Screenshot Upload */}
          <div className="mb-4">
            <FileUploadArea
              fieldName="screenshot"
              title="Attach Screenshot"
              description="Upload relevant screenshots or documents"
              onFileSelect={handleFileChange}
              selectedFile={formData.screenshot}
              onRemove={handleRemoveFile}
                accept="image/*"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-end gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="w-full sm:w-auto px-6 py-3 rounded-xl !rounded-xl font-medium text-gray-900 bg-gray-100 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-primary-500 text-white px-6 py-3 rounded-xl !rounded-xl font-medium shadow-2xl shadow-gray-300 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center cursor-pointer"
            >
              {loading ? (
                <Loader message="Submitting..." className="!p-0" />
              ) : (
                "Submit Ticket"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RaiseTicketPage;
