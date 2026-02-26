import { clerkClient } from "@clerk/express";

/**
 * Create a user in Clerk (without password) and send an invitation email
 * so they can set their password and sign in.
 * @param {Object} params
 * @param {string} params.email - Primary email for the user
 * @param {string} [params.username] - Optional username (must be unique in Clerk)
 * @param {string} [params.firstName] - Optional first name
 * @param {string} [params.lastName] - Optional last name
 * @param {string} [params.redirectUrl] - URL to redirect after accepting invite (e.g. your app sign-in page)
 * @returns {Promise<{ clerkUserId: string }>} Clerk user id
 */
export async function createClerkUserAndSendInvite({
  email,
  username,
  firstName,
  lastName,
  redirectUrl,
}) {
  const createParams = {
    emailAddress: [email],
    skipPasswordRequirement: true,
    ...(username && { username }),
    ...(firstName && { firstName }),
    ...(lastName && { lastName }),
  };

  const clerkUser = await clerkClient.users.createUser(createParams);
  const clerkUserId = clerkUser.id;

  await clerkClient.invitations.createInvitation({
    emailAddress: email,
    redirectUrl: redirectUrl || undefined,
    ignoreExisting: true, // user was just created in Clerk; invite lets them set password
  });

  return { clerkUserId };
}

/**
 * Create only an invitation in Clerk for the given email.
 * When they accept, Clerk creates the user. Use this when you don't need
 * to create the Clerk user upfront (e.g. invite-only signup).
 * @param {Object} params
 * @param {string} params.email - Email to invite
 * @param {string} [params.redirectUrl] - URL after accepting invite
 * @param {Object} [params.publicMetadata] - Metadata for the user after signup
 * @returns {Promise<{ invitationId: string }>}
 */
export async function sendClerkInvitation({ email, redirectUrl, publicMetadata }) {
  const invitation = await clerkClient.invitations.createInvitation({
    emailAddress: email,
    redirectUrl: redirectUrl || undefined,
    publicMetadata: publicMetadata || undefined,
  });
  return { invitationId: invitation.id };
}
