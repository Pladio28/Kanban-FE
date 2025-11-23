"use client";

import React, { FC } from "react";
import MemberCard from "./MemberCard";
import { Member } from "../hooks/useProjectMembers";

interface TeamListProps {
  members: Member[];
  onEditMember: (memberId: number) => void;
  onDeleteMember: (memberId: number) => void;
}

const TeamList: FC<TeamListProps> = ({ members, onEditMember, onDeleteMember }) => {
  if (!members || members.length === 0) {
    return <div className="text-sm text-slate-500">No members added yet.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {members.map((m) => (
        <MemberCard
          key={m.id}
          member={m}
          onEdit={() => onEditMember(m.id)}
          onDelete={() => onDeleteMember(m.id)}
        />
      ))}
    </div>
  );
};

export default TeamList;
