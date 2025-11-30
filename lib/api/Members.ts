import { useApi } from "../axios";

export interface MemberPayload {
  clerk_user_id: string;
  role: string;
  project_id: string;
}

export const useMembersApi = () => {
  const api = useApi();

  // GET ALL MEMBERS
  const getMembers = async (projectId: string) => {
    if (!projectId) return [];
    try {
      const res = await api.get(`/project-members/${projectId}`);
      return res.data ?? [];
    } catch (err) {
      console.error("Failed to get members:", err);
      return [];
    }
  };

  // ADD MEMBER
  const addMember = async (payload: MemberPayload) => {
    if (!payload.project_id || !payload.clerk_user_id || !payload.role) {
      throw new Error("Payload incomplete: project_id, clerk_user_id, and role are required");
    }

    try {
      const res = await api.post(`/project-members`, payload);
      return res.data;
    } catch (err) {
      console.error("Failed to add member:", err);
      throw err;
    }
  };

  // DELETE MEMBER
  const deleteMember = async (memberId: string) => {
    if (!memberId) throw new Error("Member ID is required");
    try {
      const res = await api.delete(`/project-members/${memberId}`);
      return res.data;
    } catch (err) {
      console.error("Failed to delete member:", err);
      throw err;
    }
  };

  return { getMembers, addMember, deleteMember };
};
