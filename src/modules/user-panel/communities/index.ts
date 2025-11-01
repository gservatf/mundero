// Communities Module - FASE 6.0 & 6.1 & 6.2 & 6.3 Comunidades Inteligentes
export { CommunityList } from "./pages/CommunityList";
export { CommunityDetail } from "./pages/CommunityDetail";
export { CreateCommunity } from "./pages/CreateCommunity";
export { CommunitySettings } from "./pages/CommunitySettings"; // FASE 6.3

export { CommunityCard } from "./components/CommunityCard";
export { MemberList } from "./components/MemberList";
export { JoinButton } from "./components/JoinButton";
export { CreateCommunityModal } from "./components/CreateCommunityModal"; // FASE 6.1

// FASE 6.2: Membership & Moderation Services
export { membershipService } from "./services/membershipService";
export { moderationService } from "./services/moderationService";

// FASE 6.3: Payment Components
export { SubscriptionPreview } from "./payments/SubscriptionPreview";
export { UpgradePlanModal } from "./payments/UpgradePlanModal";
export { PAYMENT_ENABLED } from "./payments/paymentConfig";

export {
  communityService,
  type Community,
  type CommunityMember,
  type CommunityPost,
  type CreateCommunityData,
  type CreateCommunityPostData,
} from "./services/communityService";
