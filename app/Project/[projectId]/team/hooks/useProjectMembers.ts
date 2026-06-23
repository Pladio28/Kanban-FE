import { useEffect, useState, useCallback } from "react";
import { useMembersApi } from "@/lib/api/Members";
import { useUser } from "@clerk/nextjs";

export interface Member {
  id: string;
  name?: string;
  role: string;
  email?: string;
  image?: string;
  clerk_user_id: string;
  isSelf?: boolean;
}

export const useProjectMembers = (projectId: string) => {
  const api = useMembersApi();
  const { user, isSignedIn } = useUser();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const mergeMemberWithUser = (member: any, clerkUsers: any[]) => {
    const u = clerkUsers.find((usr: any) => usr.id === member.clerk_user_id);

    return {
      ...member,
      name:
        u?.first_name || u?.last_name
          ? `${u?.first_name || ""} ${u?.last_name || ""}`.trim()
          : u?.username || "Unknown User",
      email: u?.email_addresses?.[0]?.email_address,
      image: u?.image_url,
    };
  };

  const fetchMembers = useCallback(async () => {
    // Stop fetch kalau belum login atau projectId kosong
    if (!projectId || !isSignedIn) return;

    try {
      setLoading(true);

      const membersRaw = await api.getMembers(projectId);
      const clerkUsers = await api.getClerkUsers();

      const merged = membersRaw.map((m: any) => {
        const mergedUser = mergeMemberWithUser(m, clerkUsers);

        return {
          ...mergedUser,
          isSelf: user?.id === m.clerk_user_id,
        };
      });

      setMembers(merged);
    } catch (err: any) {
      // Abaikan 401 saat logout — bukan error yang perlu ditampilkan
      if (err?.response?.status !== 401) {
        console.error("Failed to fetch members:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [projectId, user, isSignedIn]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const addMember = async (clerk_user_id: string, role?: string) => {
    if (!clerk_user_id) throw new Error("User ID is required");

    try {
      const created = await api.addMember({
        clerk_user_id,
        role: role || "member",
        project_id: projectId,
      });

      const clerkUsers = await api.getClerkUsers();
      const merged = mergeMemberWithUser(created, clerkUsers);

      const newMember = {
        ...merged,
        isSelf: user?.id === created.clerk_user_id,
      };

      setMembers((prev) => [...prev, newMember]);

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