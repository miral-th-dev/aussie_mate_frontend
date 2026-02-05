
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';

const PlatformPolicyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        {/* <div className="text-center mb-8">
   
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            OFFICIAL PLATFORM POLICY & PROCEDURE FRAMEWORK
          </h1>
          <p className="text-lg text-gray-600">
            Premium Marketplace Standards – Independent Contractor Model – No Insurance Provided
          </p>
        </div> */}
         <PageHeader
  title="Platform Policy"
  onBack={() => navigate(-1)}
  className="mb-4 sm:mb-6"
  titleClassName="text-base sm:text-lg md:text-xl font-semibold text-primary-500"
/>
        {/* Policy Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 space-y-8">
          
          {/* Section 1: Definitions */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. DEFINITIONS</h2>
            <p className="text-gray-700 mb-4">For clarity throughout this document:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>AUSSIEMATE</strong> – The digital marketplace platform.</li>
              <li><strong>Platform</strong> – The AUSSIEMATE website, mobile app, and related services.</li>
              <li><strong>Customer</strong> – Any user posting a task or hiring a contractor.</li>
              <li><strong>Contractor</strong> – Any independent worker accepting tasks through the platform.</li>
              <li><strong>User</strong> – Any individual using the platform (customer or contractor).</li>
              <li><strong>Task</strong> – Any job, service, or activity posted by a customer.</li>
              <li><strong>Service Fee</strong> – The AUSSIEMATE platform fee charged on completed tasks.</li>
              <li><strong>Cancellation Fee</strong> – The 15% fee charged when a customer cancels after acceptance.</li>
              <li><strong>Call-Out Fee</strong> – Compensation paid to a contractor when a customer is absent.</li>
              <li><strong>User Content</strong> – Any photos, messages, descriptions, or information uploaded to the platform.</li>
            </ul>
          </section>

          {/* Section 2: User Eligibility */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. USER ELIGIBILITY</h2>
            <p className="text-gray-700 mb-4">All users must:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Be at least 18 years old</li>
              <li>Provide accurate and truthful information</li>
              <li>Not create multiple accounts</li>
              <li>Not impersonate another person</li>
              <li>Not use the platform if previously banned</li>
              <li>Comply with all Australian laws</li>
            </ul>
            <p className="text-gray-700 mt-4">
              AUSSIEMATE may request identity verification at any time.
            </p>
          </section>

          {/* Section 3: Platform Overview */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. PLATFORM OVERVIEW</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 About AUSSIEMATE</h3>
              <p className="text-gray-700 leading-relaxed">
                AUSSIEMATE is a digital marketplace connecting customers with independent contractors for 
                a wide range of services. The platform facilitates communication, booking, and payment but 
                does not provide the services listed.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Legal Position</h3>
              <p className="text-gray-700 mb-3">AUSSIEMATE:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Is not the employer of any contractor</li>
                <li>Does not supervise or control how work is performed</li>
                <li>Does not guarantee quality, safety, or outcomes</li>
                <li>Does not provide insurance</li>
                <li>Is not liable for property damage, injury, loss, or misconduct</li>
              </ul>
              <p className="text-gray-700 mt-3 font-medium">
                All contractors operate as independent businesses.
              </p>
            </div>
          </section>

          {/* Section 4: Customer Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. CUSTOMER POLICY</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Job Posting Requirements</h3>
              <p className="text-gray-700 mb-3">Customers must ensure job listings:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Are accurate and complete</li>
                <li>Include correct location and access instructions</li>
                <li>Specify required materials</li>
                <li>Are safe and lawful</li>
                <li>Reflect a fair budget</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Customer Privacy</h3>
              <p className="text-gray-700 mb-3">Customer contact details remain hidden until:</p>
              <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                <li>The customer selects a contractor</li>
                <li>AUSSIEMATE receives full payment</li>
              </ol>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Payment Conditions</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Payment must be made before contractor details are released</li>
                <li>AUSSIEMATE holds payment securely until completion</li>
                <li>Refunds follow the cancellation policy</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.4 Customer Conduct</h3>
              <p className="text-gray-700 mb-3">Customers must:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Communicate respectfully</li>
                <li>Provide safe access</li>
                <li>Not request illegal or unsafe tasks</li>
                <li>Not request personal information</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.5 Prohibited Job Types</h3>
              <p className="text-gray-700 mb-3">Customers may not post:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Illegal activities</li>
                <li>High-risk licensed work</li>
                <li>Medical or personal care tasks</li>
                <li>Tasks involving minors without supervision</li>
                <li>Tasks requiring insurance</li>
                <li>Hazardous or dangerous tasks</li>
              </ul>
            </div>
          </section>

          {/* Section 5: Contractor Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. CONTRACTOR POLICY</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Eligibility Requirements</h3>
              <p className="text-gray-700 mb-3">Contractors must:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Be 18+</li>
                <li>Hold a valid ABN</li>
                <li>Provide accurate identity information</li>
                <li>Have the right to work in Australia</li>
                <li>Possess relevant skills</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.2 Contractor Responsibilities</h3>
              <p className="text-gray-700 mb-3">Contractors must:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Arrive on time</li>
                <li>Communicate clearly</li>
                <li>Provide their own tools</li>
                <li>Follow WHS requirements</li>
                <li>Respect customer property</li>
                <li>Not bring guests</li>
                <li>Not smoke, drink, or use substances</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.3 Payment Release</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Customer pays AUSSIEMATE first</li>
                <li>Contractor payment is released within 24–72 hours after completion</li>
                <li>Platform fees + GST are deducted</li>
                <li>Payment may be delayed if a dispute is raised</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.4 Prohibited Contractor Conduct</h3>
              <p className="text-gray-700 mb-3">Contractors must not:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Steal or damage property</li>
                <li>Harass or threaten customers</li>
                <li>Misrepresent skills</li>
                <li>Perform unsafe or illegal work</li>
                <li>Share customer details</li>
                <li>Repeatedly cancel jobs</li>
              </ul>
            </div>
          </section>

          {/* Section 6: Cancellation Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. CANCELLATION POLICY</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">6.1 Customer Cancellations</h3>
              <div className="mb-4">
                <p className="text-gray-700 font-medium mb-2">Before contractor acceptance</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Free cancellation</li>
                </ul>
              </div>
              <div className="mb-4">
                <p className="text-gray-700 font-medium mb-2">After contractor acceptance</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>15% AUSSIEMATE cancellation fee</li>
                </ul>
              </div>
              <div>
                <p className="text-gray-700 font-medium mb-2">Within 2 hours of start time</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>15% cancellation fee</li>
                  <li>Contractor may receive a call-out fee</li>
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">6.2 Contractor Cancellations</h3>
              <div className="mb-4">
                <p className="text-gray-700 font-medium mb-2">Before confirming with customer</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>No penalty</li>
                </ul>
              </div>
              <div className="mb-4">
                <p className="text-gray-700 font-medium mb-2">After confirming</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Must provide reasonable notice</li>
                  <li>Repeated cancellations may lead to suspension</li>
                </ul>
              </div>
              <div>
                <p className="text-gray-700 font-medium mb-2">Within 2 hours of start time</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Penalties may apply</li>
                  <li>Visibility may be reduced</li>
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">6.3 No-Show Rules</h3>
              <div className="mb-4">
                <p className="text-gray-700 font-medium mb-2">Customer No-Show</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Contractor may receive a call-out fee</li>
                </ul>
              </div>
              <div>
                <p className="text-gray-700 font-medium mb-2">Contractor No-Show</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Customer refunded</li>
                  <li>Contractor may face penalties</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 7: Safety & Risk Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. SAFETY & RISK POLICY</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">7.1 General Safety</h3>
              <p className="text-gray-700 mb-3">All users must:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Follow WHS laws</li>
                <li>Avoid unsafe environments</li>
                <li>Stop work if hazards arise</li>
                <li>Report safety concerns</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">7.2 Restricted Work</h3>
              <p className="text-gray-700 mb-3">Contractors must not perform:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Electrical work (unless licensed)</li>
                <li>Plumbing (unless licensed)</li>
                <li>Roofing or height-related work</li>
                <li>Asbestos handling</li>
                <li>Confined space work</li>
                <li>Any task requiring insurance</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">7.3 Insurance Notice</h3>
              <p className="text-gray-700 mb-3">AUSSIEMATE does not provide:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Public liability insurance</li>
                <li>Workers compensation</li>
                <li>Property damage cover</li>
                <li>Pet insurance</li>
                <li>Personal injury cover</li>
              </ul>
              <p className="text-gray-700 mt-3 font-medium">
                All risks are accepted by customers and contractors.
              </p>
            </div>
          </section>

          {/* Section 8: Service Category Standards */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. SERVICE CATEGORY STANDARDS</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">8.1 Commercial Cleaning</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Safe chemical use</li>
                <li>Site access compliance</li>
                <li>Confidentiality</li>
                <li>Immediate damage reporting</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">8.2 Student Cleaner</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Basic cleaning only</li>
                <li>No chemical use unless trained</li>
                <li>No heavy lifting</li>
                <li>No deep cleaning</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">8.3 Pet Sitting</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Follow owner instructions</li>
                <li>No guests in client homes</li>
                <li>Provide updates</li>
                <li>Follow emergency procedures</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">8.4 Non-NDIS Home Support</h3>
              <div className="mb-4">
                <p className="text-gray-700 font-medium mb-2">Permitted Tasks</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Light domestic cleaning</li>
                  <li>Meal preparation (non-medical)</li>
                  <li>Grocery shopping and errands</li>
                  <li>Laundry and folding</li>
                  <li>Basic household organisation</li>
                  <li>Social companionship</li>
                  <li>Non-medical wellbeing checks</li>
                  <li>Pet care</li>
                </ul>
              </div>
              <div>
                <p className="text-gray-700 font-medium mb-2">Strictly Not Permitted</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Personal care</li>
                  <li>Medication handling</li>
                  <li>Lifting or transferring clients</li>
                  <li>Medical tasks</li>
                  <li>Disability-related support</li>
                  <li>Any NDIS-funded or aged-care tasks</li>
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">8.5 Handyman Services</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Only tasks within skill level</li>
                <li>No licensed trade work unless qualified</li>
                <li>Customer approval required</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">8.6 Housekeeping</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Respect belongings</li>
                <li>Follow laundry rules</li>
                <li>Maintain privacy</li>
                <li>Do not open locked rooms</li>
              </ul>
            </div>
          </section>

          {/* Section 9: User Content & Communication */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. USER CONTENT & COMMUNICATION</h2>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-3">Users must not upload or send:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Abusive or threatening messages</li>
                <li>False or misleading information</li>
                <li>Inappropriate photos</li>
                <li>Illegal content</li>
              </ul>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-3">AUSSIEMATE may use uploaded content for:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Dispute resolution</li>
                <li>Safety reviews</li>
                <li>Platform improvement</li>
              </ul>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                AUSSIEMATE may remove content or suspend accounts that violate these rules.
              </p>
            </div>
          </section>

          {/* Section 10: Prohibited Use of Platform */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. PROHIBITED USE OF PLATFORM</h2>
            
            <p className="text-gray-700 mb-3">Users must not:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Circumvent AUSSIEMATE fees</li>
              <li>Arrange off-platform payments</li>
              <li>Advertise external services</li>
              <li>Create fake jobs or accounts</li>
              <li>Engage in fraud or scams</li>
              <li>Use the platform for illegal activity</li>
              <li>Harass or abuse other users</li>
            </ul>
          </section>

          {/* Section 11: Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. INTELLECTUAL PROPERTY</h2>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                All AUSSIEMATE branding, logos, designs, text, images, and technology are the property of AUSSIEMATE.
              </p>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-3">Users may not:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Copy</li>
                <li>Reproduce</li>
                <li>Modify</li>
                <li>Distribute</li>
                <li>Reverse-engineer</li>
              </ul>
              <p className="text-gray-700 mt-3">
                any part of the platform.
              </p>
            </div>
          </section>

          {/* Section 12: Account Termination Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. ACCOUNT TERMINATION RIGHTS</h2>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                AUSSIEMATE may suspend or terminate accounts at its discretion for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Fraud</li>
                <li>Safety risks</li>
                <li>Repeated cancellations</li>
                <li>Abuse or harassment</li>
                <li>Illegal activity</li>
                <li>Breach of policies</li>
                <li>Misuse of the platform</li>
              </ul>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Termination may be immediate without notice.
              </p>
            </div>
          </section>

          {/* Section 13: Dispute Resolution */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. DISPUTE RESOLUTION</h2>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-3">AUSSIEMATE may request:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Photos</li>
                <li>Messages</li>
                <li>Job notes</li>
                <li>Before/after images</li>
                <li>Time logs</li>
              </ul>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-3">AUSSIEMATE may:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Review evidence</li>
                <li>Facilitate communication</li>
                <li>Make a final decision</li>
              </ul>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-3">AUSSIEMATE does not:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Guarantee outcomes</li>
                <li>Force refunds</li>
                <li>Accept liability</li>
              </ul>
            </div>
          </section>

          {/* Section 14: Fees & Charges */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. FEES & CHARGES</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">14.1 Platform Service Fee</h3>
              <p className="text-gray-700">
                AUSSIEMATE charges a Platform Service Fee + GST on every completed task.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">14.2 GST</h3>
              <p className="text-gray-700">
                All AUSSIEMATE fees are subject to GST.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">14.3 Cancellation Fee</h3>
              <p className="text-gray-700">
                A 15% cancellation fee applies when a customer cancels after contractor acceptance.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">14.4 Call-Out Fee</h3>
              <p className="text-gray-700">
                If a customer is absent or unreachable, a call-out fee may be paid to the contractor.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">14.5 Payment Processing Fees</h3>
              <p className="text-gray-700">
                Third-party payment providers may apply additional fees.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">14.6 Fee Updates</h3>
              <p className="text-gray-700">
                AUSSIEMATE may update fees at any time.
              </p>
            </div>
          </section>

          {/* Section 15: Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. LIMITATION OF LIABILITY</h2>
            
            <p className="text-gray-700 mb-3">AUSSIEMATE is not liable for:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Injury</li>
              <li>Property damage</li>
              <li>Theft</li>
              <li>Loss of income</li>
              <li>Misconduct</li>
              <li>Poor workmanship</li>
              <li>Incorrect job information</li>
              <li>Delays or cancellations</li>
              <li>Any outcome of a task</li>
            </ul>
            <p className="text-gray-700 mt-3 font-medium">
              Users accept full responsibility for their actions.
            </p>
          </section>

          {/* Section 16: Indemnity */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">16. INDEMNITY</h2>
            
            <p className="text-gray-700 mb-3">
              Customers and contractors agree to indemnify AUSSIEMATE against:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Claims</li>
              <li>Losses</li>
              <li>Damages</li>
              <li>Legal costs</li>
              <li>Liabilities</li>
            </ul>
            <p className="text-gray-700 mt-3">
              arising from their actions, negligence, or breach of these policies.
            </p>
          </section>

          {/* Section 17: Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">17. GOVERNING LAW</h2>
            
            <p className="text-gray-700">
              These policies are governed by the laws of Queensland, Australia.
            </p>
          </section>

          {/* Section 18: Amendments */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">18. AMENDMENTS</h2>
            
            <p className="text-gray-700 mb-3">
              AUSSIEMATE may update these policies at any time.
            </p>
            <p className="text-gray-700">
              Continued use of the platform indicates acceptance of updated terms.
            </p>
          </section>

          {/* Section 19: Severability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">19. SEVERABILITY</h2>
            
            <p className="text-gray-700">
              If any part of this document is found invalid, the remaining sections remain fully enforceable.
            </p>
          </section>

          {/* Section 20: App Store Compliance & Verification Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">20. APP STORE COMPLIANCE & VERIFICATION POLICY</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">20.1 Transparency Requirements</h3>
              <p className="text-gray-700">
                AUSSIEMATE clearly communicates that all contractors operate as independent businesses. The platform acts only as a digital marketplace and does not employ, manage, or supervise any contractor.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">20.2 Digital Payments & In-App Transactions</h3>
              <p className="text-gray-700">
                All payments are processed securely through approved third-party payment gateways integrated within the AUSSIEMATE app, in compliance with Apple's App Store Review Guidelines.
              </p>
              <p className="text-gray-700">
                Off-platform or direct cash payments are strictly prohibited.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">20.3 User Data & Privacy Compliance</h3>
              <p className="text-gray-700">
                AUSSIEMATE fully complies with the Australian Privacy Act 1988 (Cth), the Australian Consumer Law, and the Apple App Store privacy requirements.
              </p>
              <p className="text-gray-700">
                All personal data collected through the app (including photos, messages, and location data) is used solely for the purpose of task management, safety, and service improvement.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">20.4 Refunds, Disputes & Responsibility</h3>
              <p className="text-gray-700">
                All cancellations, refunds, and disputes are managed directly by AUSSIEMATE through its in-app resolution system.
              </p>
              <p className="text-gray-700">
                Apple Inc. is not responsible for payments, refunds, or disputes between users.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">20.5 Content Moderation & Safety Compliance</h3>
              <p className="text-gray-700">
                AUSSIEMATE actively monitors user-generated content (photos, messages, job descriptions) to ensure compliance with App Store policies, Australian law, and community standards.
              </p>
              <p className="text-gray-700">
                Any content found to be abusive, illegal, or misleading may be removed without notice.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">20.6 Third-Party Tools & Compliance</h3>
              <p className="text-gray-700">
                All contractors and customers must use the AUSSIEMATE mobile app in accordance with Apple's App Store Terms of Service and maintain compliance with applicable device and software security standards.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">20.7 App Distribution & Jurisdiction</h3>
              <p className="text-gray-700">
                The AUSSIEMATE mobile app is distributed exclusively via the Apple App Store and is intended for lawful use within Australia.
              </p>
              <p className="text-gray-700">
                All disputes or claims are governed by the laws of Queensland, Australia.
              </p>
            </div>
          </section>

          {/* Navigation */}
          <div className="border-t pt-6 mt-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <Link 
                to="/"
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
              >
                ← Back to Home
              </Link>
              <div className="flex gap-4">
                <Link 
                  to="/terms"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Terms of Service
                </Link>
                <Link 
                  to="/privacy"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default PlatformPolicyPage;
