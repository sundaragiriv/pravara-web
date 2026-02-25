/**
 * Collaborator Role-Based Permissions
 *
 * Defines what each collaborator role can do when managing
 * someone else's profile in Guardian Mode.
 */

export type CollaboratorRole = "Parent" | "Sibling" | "Relative" | "Friend";

export interface CollaboratorPermissions {
  viewMatches: boolean;
  shortlist: boolean;
  sendInterest: boolean;
  suggestProfile: boolean;
  editProfile: boolean;
  chat: boolean;
}

const ROLE_PERMISSIONS: Record<CollaboratorRole, CollaboratorPermissions> = {
  Parent: {
    viewMatches: true,
    shortlist: true,
    sendInterest: true,
    suggestProfile: true,
    editProfile: true,
    chat: false,
  },
  Sibling: {
    viewMatches: true,
    shortlist: true,
    sendInterest: false,
    suggestProfile: true,
    editProfile: false,
    chat: false,
  },
  Relative: {
    viewMatches: true,
    shortlist: true,
    sendInterest: false,
    suggestProfile: true,
    editProfile: false,
    chat: false,
  },
  Friend: {
    viewMatches: true,
    shortlist: false,
    sendInterest: false,
    suggestProfile: true,
    editProfile: false,
    chat: false,
  },
};

export function getCollaboratorPermissions(role: string): CollaboratorPermissions {
  return ROLE_PERMISSIONS[role as CollaboratorRole] ?? ROLE_PERMISSIONS.Friend;
}
