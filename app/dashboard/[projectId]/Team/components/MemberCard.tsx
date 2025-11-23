"use client";

import { FC } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Member } from "../hooks/useProjectMembers";
import { cn } from "@/lib/utils";

interface Props {
  member: Member;
  onEdit: () => void;
  onDelete: () => void;
}

const MemberCard: FC<Props> = ({ member, onEdit, onDelete }) => {
  return (
    <div
      className={cn(
        "group relative bg-[#0f172a] border border-white/10 rounded-xl p-5",
        "transition-all duration-300",
        "hover:shadow-xl hover:shadow-blue-500/20",
        "hover:border-blue-500/40 hover:scale-[1.03]",
        "cursor-pointer flex flex-col justify-between min-h-[220px]"
      )}
    >
      <div className="flex flex-col items-center text-center mb-4">
        <Avatar className="w-16 h-16 transition-all group-hover:scale-110">
          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.name}`} />
          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <h3 className="text-white font-semibold text-lg mt-3">{member.name}</h3>
        <p className="text-gray-400 text-sm">{member.role}</p>
        <p className="text-gray-500 text-xs">{member.email}</p>
      </div>

      <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
        <Button size="sm" variant="secondary" onClick={onEdit}>
          Edit
        </Button>
        <Button size="sm" variant="destructive" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
};

export default MemberCard;
