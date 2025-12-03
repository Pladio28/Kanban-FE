import { useApi } from "../axios";

export interface MemberPayload {
  clerk_user_id: string;
  role: string;
  project_id: string;
}

export const useMembersApi = () => {
  const api = useApi();

  // 🔥 GET ALL MEMBERS FROM BACKEND (pure data from DB)
  const getMembers = async (projectId: string) => {
    if (!projectId) return [];

    try {
      const res = await api.get(`/project-members/${projectId}`);
      return res.data?.data ?? []; // backend: { success, message, data }
    } catch (err) {
      console.error("Failed to get members:", err);
      return [];
    }
  };

  // 🔥 GET USERS FROM CLERK (to merge name/email/profile)
  const getClerkUsers = async () => {
    try {
      const res = await api.get(`/clerk-users`);
      return res.data?.users ?? [];
    } catch (err) {
      console.error("Failed to fetch clerk users:", err);
      return [];
    }
  };

  // 🔥 ADD MEMBER
  const addMember = async (payload: MemberPayload) => {
    try {
      const res = await api.post(`/project-members`, payload);
      return res.data?.data; // backend returns { success, message, data }
    } catch (err) {
      console.error("Failed to add member:", err);
      throw err;
    }
  };

  // 🔥 DELETE MEMBER
  const deleteMember = async (memberId: string) => {
    try {
      const res = await api.delete(`/project-members/${memberId}`);
      return res.data;
    } catch (err) {
      console.error("Failed to delete member:", err);
      throw err;
    }
  };

  return { getMembers, addMember, deleteMember, getClerkUsers };
};
