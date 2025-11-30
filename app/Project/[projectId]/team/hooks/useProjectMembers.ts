import { useEffect, useState, useCallback } from "react";
import { useMembersApi } from "@/lib/api/Members";

export interface Member {
  id: string;
  name?: string;
  role: string;
  email?: string;
}

export const useProjectMembers = (projectId: string) => {
  const api = useMembersApi();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await api.getMembers(projectId);
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch members:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const addMember = async (clerk_user_id: string, role?: string) => {
    if (!clerk_user_id) throw new Error("User ID is required");

    try {
      const newMember = await api.addMember({
        clerk_user_id,
        role: role || "Member", // default role
        project_id: projectId,
      });

      if (newMember) setMembers((prev) => [...prev, newMember]);
      return newMember;
    } catch (err) {
      console.error("Failed to add member:", err);
      throw err;
    }
  };

  const deleteMember = async (memberId: string) => {
    try {
      await api.deleteMember(memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      console.error("Failed to delete member:", err);
      throw err;
    }
  };

  return { members, loading, fetchMembers, addMember, deleteMember };
};
