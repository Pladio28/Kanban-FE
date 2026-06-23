"use client";

import { FC, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Member } from "../hooks/useProjectMembers";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface Props {
  member: Member;
  onDelete?: () => void;
  isAdmin?: boolean;
}

const MemberCard: FC<Props> = ({ member, onDelete, isAdmin }) => {
  const firstChar = member.name ? member.name.charAt(0) : "?";

  const canDelete = isAdmin && !member.isSelf; // 🔥 ADMIN GA BISA HAPUS DIRI SENDIRI

  return (
      <div
        className={cn(
          "group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5",
          "transition-all duration-300",
          "hover:shadow-xl hover:shadow-red-500/20",
          "hover:border-red-500/40 hover:scale-[1.03]",
          "flex flex-col justify-between min-h-[220px]"
        )}
      >
      <div className="flex flex-col items-center text-center mb-4">
        <Avatar className="w-16 h-16 ring-2 ring-red-500/30">
          <AvatarImage
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.name}`}
          />
          <AvatarFallback>{firstChar}</AvatarFallback>
        </Avatar>

        <h3 className="text-white font-semibold text-lg mt-3">
          {member.name}
        </h3>
        <p className="text-gray-400 text-sm">{member.role}</p>
        <p className="text-gray-500 text-xs">{member.email}</p>
      </div>

      {canDelete && (
        <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-all">
          <AlertDialog>
            <AlertDialogTrigger asChild>
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Member?</AlertDialogTitle>
                <AlertDialogDescription>
                  Member <b>{member.name}</b> akan dihapus dari project ini.
                  Tindakan ini tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={onDelete}
                >
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
};

export default MemberCard;
