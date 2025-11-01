# User Panel Services - MUNDERO v2.1

## 📋 Overview

Base Firebase services for the user panel module, providing clean abstractions for data operations without any UI dependencies.

## 🔧 Services Created

### 1. **profileService.ts** - User Profile Management

- `getUserProfile(uid)` - Fetch user profile data
- `updateUserProfile(uid, data)` - Update profile information
- `createUserProfile(uid, initialData)` - Create new profile
- `listenToUserProfile(uid, callback)` - Real-time profile updates
- `profileExists(uid)` - Check if profile exists

**Features:**

- Complete user profile with preferences
- Real-time updates via Firebase listeners
- Automatic timestamp management
- Type-safe profile data structure

### 2. **agreementService.ts** - Legal Agreement Management

- `getUserAgreementStatus(uid)` - Get signing status for all agreements
- `signUserAgreement(uid, agreementType, data)` - Sign specific agreement
- `revokeUserAgreement(uid, agreementType, reason)` - Revoke agreement
- `listenToAgreementStatus(uid, callback)` - Real-time agreement updates
- `checkForUpdatedAgreements(uid)` - Check if user needs to sign new versions

**Features:**

- Version-aware agreement tracking
- Multiple agreement types (Terms, Privacy, Data Processing, Marketing)
- IP address and user agent logging
- Automatic default status creation

### 3. **storageService.ts** - File Upload & Management

- `uploadFile(file, path, options)` - Upload files with progress tracking
- `getFileUrl(path)` - Get download URLs
- `deleteFile(path)` - Remove files
- `getFileMetadata(path)` - Get file information
- `uploadProfilePicture(file, uid, options)` - Specialized profile uploads
- `uploadDocument(file, uid, documentType, options)` - Document uploads
- `uploadFeedMedia(file, uid, postId, options)` - Media for feed posts

**Features:**

- Progress tracking for large uploads
- Automatic file validation (size, type)
- Organized file paths by category
- Custom metadata support

### 4. **feedService.ts** - Social Feed System

- `createPost(uid, data)` - Create new feed posts
- `getGlobalFeed()` - Public feed with pagination
- `getUserFeed(uid)` - Personalized user feed
- `getPublicFeedByUsername(username)` - User-specific public feed
- `togglePostLike(postId, uid)` - Like/unlike posts
- `addComment(postId, uid, commentData)` - Add comments
- `deletePost(postId, uid)` - Remove posts

**Features:**

- Multiple post types (text, media, shared, events)
- Engagement tracking (likes, comments, shares, views)
- User preferences and filtering
- Real-time interaction capabilities

## 🛠 Architecture Principles

### ✅ Firebase-Only Implementation

- Uses only Firebase services (Firestore, Storage, Auth)
- No Supabase dependencies
- Clean separation from UI components

### ✅ Type Safety

- Complete TypeScript interfaces for all data structures
- Proper error handling and validation
- Consistent return types

### ✅ Real-time Capabilities

- Firebase onSnapshot listeners for live updates
- Proper unsubscribe functions returned
- Error handling in listeners

### ✅ Production Ready

- Comprehensive error logging
- Proper timestamp handling with serverTimestamp()
- Optimized queries with proper indexing considerations

## 📖 Usage Examples

```typescript
// Profile management
import { profileService } from "./services";

const profile = await profileService.getUserProfile(uid);
await profileService.updateUserProfile(uid, { displayName: "New Name" });

// Real-time profile updates
const unsubscribe = profileService.listenToUserProfile(uid, (profile) => {
  console.log("Profile updated:", profile);
});

// Agreement handling
import { agreementService } from "./services";

await agreementService.signUserAgreement(uid, "terms_of_service", {
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
});

// File uploads
import { storageService } from "./services";

const downloadURL = await storageService.uploadProfilePicture(file, uid, {
  onProgress: (progress) => console.log(progress.percentage),
  onComplete: (url) => console.log("Upload complete:", url),
});

// Feed operations
import { feedService } from "./services";

const postId = await feedService.createPost(uid, {
  content: { text: "Hello MUNDERO!" },
  visibility: "public",
  type: "text",
  authorName: "User Name",
});

const feed = await feedService.getGlobalFeed({ limitCount: 20 });
```

## 🔄 Next Steps

These services are ready for integration with hooks and UI components in the next development phases.

**Prepared for:**

- React hook integration (`useProfile`, `useAgreements`, `useStorage`, `useFeed`)
- Component integration with loading states and error handling
- Real-time UI updates via Firebase listeners
- Form validation and user input handling

---

**MUNDERO v2.1** - Base services layer complete and ready for hook implementation.
