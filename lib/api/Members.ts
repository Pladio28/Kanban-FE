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
    const res = await api.get(`/project-members/${projectId}`);
    return res.data?.data ?? [];
  };

  // ADD MEMBER
  const addMember = async (payload: MemberPayload) => {
    const res = await api.post(`/project-members`, payload);
    return res.data?.data;
  };

  // DELETE MEMBER
  const deleteMember = async (memberId: string) => {
    const res = await api.delete(`/project-members/${memberId}`);
    return res.data;
  };

  return { getMembers, addMember, deleteMember };
};
