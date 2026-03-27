import React from 'react'
import PlatformPolicyPage from './pages/legal/PlatformPolicyPage'

export const CLEANER_ROLES = [
  'Cleaner',
]

// Auth pages
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'))
const RoleSelectionPage = React.lazy(() => import('./pages/auth/RoleSelectionPage'))
const SignupPage = React.lazy(() => import('./pages/auth/SignupPage'))
const NDISPlanInfoPage = React.lazy(() => import('./pages/auth/NDISPlanInfoPage'))
const ForgotPasswordPage = React.lazy(() => import('./pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = React.lazy(() => import('./pages/auth/ResetPasswordPage'))
const VerifyDocumentsPage = React.lazy(() => import('./pages/auth/VerifyDocumentsPage'))

// Customer pages
const CustomerDashboard = React.lazy(() => import('./pages/customer/CustomerDashboard'))
const PostNewJobPage = React.lazy(() => import('./pages/customer/PostNewJobPage'))
const JobSuccessPage = React.lazy(() => import('./pages/customer/JobSuccessPage'))
const MyJobsPage = React.lazy(() => import('./pages/customer/MyJobsPage'))
const CustomerJobDetailsPage = React.lazy(() => import('./pages/customer/CustomerJobDetailsPage'))
const JobDetailsCompletedPage = React.lazy(() => import('./pages/customer/JobDetailsCompletedPage'))
const CustomerChatPage = React.lazy(() => import('./pages/customer/CustomerChatPage'))
const JobBookedSuccessfullyPage = React.lazy(() => import('./pages/customer/JobBookedSuccessfullyPage'))
const CustomerInProgressJobDetailsPage = React.lazy(() => import('./pages/customer/CustomerInProgressJobDetailsPage'))
const JobDetailsPage = React.lazy(() => import('./pages/cleaner/JobDetailsPage'))
const LocationPage = React.lazy(() => import('./pages/customer/LocationPage'))

// Profile pages
const ProfilePage = React.lazy(() => import('./pages/profile/ProfilePage'))
const EditProfilePage = React.lazy(() => import('./pages/profile/EditProfilePage'))
const WalletPage = React.lazy(() => import('./pages/profile/customer/WalletPage'))
const MatePointsPage = React.lazy(() => import('./pages/profile/customer/MatePointsPage'))
const RewardSuccessPage = React.lazy(() => import('./pages/profile/customer/RewardSuccessPage'))
const InvoicesPage = React.lazy(() => import('./pages/profile/customer/InvoicesPage'))
const NotificationPage = React.lazy(() => import('./pages/profile/NotificationPage'))
const NotificationSettingsPage = React.lazy(() => import('./pages/profile/NotificationSettingsPage'))
const HelpSupportPage = React.lazy(() => import('./pages/profile/HelpSupportPage'))
const LiveChatPage = React.lazy(() => import('./pages/profile/LiveChatPage'))
const MyTicketsPage = React.lazy(() => import('./pages/profile/MyTicketsPage'))
const RaiseTicketPage = React.lazy(() => import('./pages/profile/RaiseTicketPage'))
const SupportTicketDetailsPage = React.lazy(() => import('./pages/profile/SupportTicketDetailsPage'))
const VerificationStatusPage = React.lazy(() => import('./pages/profile/cleaner/VerificationStatusPage'))
const AvailabilityPage = React.lazy(() => import('./pages/profile/cleaner/AvailabilityPage'))
const PaymentsPayoutsPage = React.lazy(() => import('./pages/profile/cleaner/PaymentsPayoutsPage'))
const ReviewsPage = React.lazy(() => import('./pages/profile/cleaner/ReviewsPage'))

// Cleaner pages
const SetCleanerLocationPage = React.lazy(() => import('./pages/cleaner/SetCleanerLocationPage'))
const CleanerDashboard = React.lazy(() => import('./pages/cleaner/CleanerDashboard'))
const CleanerJobsPage = React.lazy(() => import('./pages/cleaner/CleanerJobsPage'))
const InProgressJobDetailsPage = React.lazy(() => import('./pages/cleaner/InProgressJobDetailsPage'))
const CleanerJobCompletedPage = React.lazy(() => import('./pages/cleaner/CleanerJobCompletedPage'))
const CompleteJobPage = React.lazy(() => import('./pages/cleaner/CompleteJobPage'))
const ProviderComplianceQuizPage = React.lazy(() => import('./pages/cleaner/ProviderComplianceQuizPage'))
const CleanerChatPage = React.lazy(() => import('./pages/cleaner/CleanerChatPage'))
const EarningsPage = React.lazy(() => import('./pages/cleaner/EarningsPage'))
const MySubscriptionPage = React.lazy(() => import('./pages/cleaner/MySubscriptionPage'))
const SubscriptionSuccessPage = React.lazy(() => import('./pages/cleaner/SubscriptionSuccessPage'))
const BuyCreditsPage = React.lazy(() => import('./pages/cleaner/BuyCreditsPage'))
const CreditsSuccessPage = React.lazy(() => import('./pages/cleaner/CreditsSuccessPage'))
const LeadUsageHistoryPage = React.lazy(() => import('./pages/cleaner/LeadUsageHistoryPage'))

// Shared pages
const StripeSuccessPage = React.lazy(() => import('./pages/StripeSuccessPage'))

export const authRoutes = [
  { path: '/login', component: LoginPage },
  { path: '/select-role', component: RoleSelectionPage },
  { path: '/signup', component: SignupPage },
  { path: '/ndis-plan-info', component: NDISPlanInfoPage },
  { path: '/forgot-password', component: ForgotPasswordPage },
  { path: '/reset-password', component: ResetPasswordPage },
  { path: '/platform-policy', component: PlatformPolicyPage, showHeader: true },
]

export const customerRoutes = [
  { path: '/customer-dashboard', component: CustomerDashboard },
  { path: '/post-new-job', component: PostNewJobPage },
  { path: '/job-success', component: JobSuccessPage },
  { path: '/my-jobs', component: MyJobsPage },
  { path: '/profile', component: ProfilePage, allowedRoles: ['Customer', ...CLEANER_ROLES] },
  { path: '/edit-profile', component: EditProfilePage, allowedRoles: ['Customer', ...CLEANER_ROLES] },
  { path: '/wallet', component: WalletPage },
  { path: '/rewards', component: MatePointsPage },
  { path: '/reward-success', component: RewardSuccessPage },
  { path: '/invoices', component: InvoicesPage },
  { path: '/notifications', component: NotificationPage, allowedRoles: ['Customer', ...CLEANER_ROLES] },
  { path: '/notifications-settings', component: NotificationSettingsPage, allowedRoles: ['Customer', ...CLEANER_ROLES] },
  { path: '/help', component: HelpSupportPage, allowedRoles: ['Customer', ...CLEANER_ROLES] },
  { path: '/live-chat', component: LiveChatPage },
  { path: '/my-tickets', component: MyTicketsPage, allowedRoles: ['Customer', ...CLEANER_ROLES] },
  { path: '/my-tickets/:id', component: SupportTicketDetailsPage, allowedRoles: ['Customer', ...CLEANER_ROLES] },
  { path: '/raise-ticket', component: RaiseTicketPage, allowedRoles: ['Customer', ...CLEANER_ROLES] },
  { path: '/customer-job-details/:jobId', component: CustomerJobDetailsPage },
  { path: '/job-completed/:jobId', component: JobDetailsCompletedPage },
  { path: '/customer-chat/:jobId', component: CustomerChatPage },
  { path: '/booking-confirmation/:jobId', component: JobBookedSuccessfullyPage },
  { path: '/customer-in-progress-job/:jobId', component: CustomerInProgressJobDetailsPage },
  { path: '/platform-policy', component: PlatformPolicyPage },
]

export const cleanerRoutes = [
  { path: '/verify-documents', component: VerifyDocumentsPage, showHeader: false },
  { path: '/verification', component: VerificationStatusPage },
  { path: '/availability', component: AvailabilityPage },
  { path: '/payments', component: PaymentsPayoutsPage },
  { path: '/reviews', component: ReviewsPage },
  { path: '/set-cleaner-location', component: SetCleanerLocationPage },
  { path: '/cleaner-dashboard', component: CleanerDashboard },
  { path: '/cleaner-jobs', component: CleanerJobsPage },
  { path: '/job-details/:jobId', component: JobDetailsPage },
  { path: '/in-progress-job/:jobId', component: InProgressJobDetailsPage },
  { path: '/cleaner-job-completed/:jobId', component: CleanerJobCompletedPage },
  { path: '/cleaner/complete-job/:jobId', component: CompleteJobPage },
  { path: '/cleaner/compliance-quiz', component: ProviderComplianceQuizPage },
  { path: '/chat/:jobId', component: CleanerChatPage },
  { path: '/earnings', component: EarningsPage },
  { path: '/my-subscription', component: MySubscriptionPage },
  { path: '/lead-usage-history', component: LeadUsageHistoryPage },
  { path: '/buy-credits', component: BuyCreditsPage },
  { path: '/subscription/success', component: SubscriptionSuccessPage, showHeader: false },
  { path: '/credits/success', component: CreditsSuccessPage, showHeader: false },
  { path: '/cleaner/stripe/success', component: StripeSuccessPage },
  { path: '/platform-policy', component: PlatformPolicyPage },
  { path: '/location', component: LocationPage, allowedRoles: ['Customer', ...CLEANER_ROLES], showHeader: false },
]

