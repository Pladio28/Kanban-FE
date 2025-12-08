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
  const { user } = useUser();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Merge database member with Clerk profile
  const mergeMemberWithClerk = useCallback((member: any, clerkUsers: any[]) => {
    const u = clerkUsers.find((usr: any) => usr.id === member.clerk_user_id);

    return {
      ...member,
      name:
        u?.first_name || u?.last_name
          ? `${u?.first_name || ""} ${u?.last_name || ""}`.trim()
          : u?.username || "Unknown User",
      email: u?.email_addresses?.[0]?.email_address,
      image: u?.image_url,
      isSelf: user?.id === member.clerk_user_id,
    };
  }, [user?.id]);

  // Fetch all members + merge with clerk
  const fetchMembers = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoading(true);

      const membersRaw = await api.getMembers(projectId);
      const clerkUsers = await api.getClerkUsers();

      const merged = membersRaw.map((m: any) =>
        mergeMemberWithClerk(m, clerkUsers)
      );

      setMembers(merged);
    } catch (err) {
      console.error("Failed to fetch members:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, mergeMemberWithClerk]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Add member
  const addMember = async ({
    clerk_user_id,
    role = "member",
  }: {
    clerk_user_id: string;
    role?: string;
  }) => {
    if (!clerk_user_id) throw new Error("User ID is required");

    try {
      const created = await api.addMember({
        clerk_user_id,
        project_id: projectId,
        role,
      });

      const clerkUsers = await api.getClerkUsers();
      const merged = mergeMemberWithClerk(created, clerkUsers);

      setMembers((prev) => [...prev, merged]);

      return merged;
    } catch (err) {
      console.error("Failed to add member:", err);
    }
  };

  return {
    members,
    loading,
    fetchMembers,
    addMember,
  };
};
