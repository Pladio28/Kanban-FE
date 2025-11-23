"use client";

import React, { FC, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Member } from "../hooks/useProjectMembers";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onUpdateMember: (id: number, name: string, role: string, email: string) => void;
}

const EditMemberModal: FC<Props> = ({ isOpen, onClose, member, onUpdateMember }) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (member) {
      setName(member.name);
      setRole(member.role);
      setEmail(member.email);
    } else {
      setName("");
      setRole("");
      setEmail("");
    }
  }, [member]);

  const handleSubmit = () => {
    if (!member) return;
    onUpdateMember(member.id, name.trim(), role.trim() || "Member", email.trim());
    onClose();
  };

  if (!member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <div>
            <label className="text-sm block mb-1">Name</label>
            <Input value={name} onChange={(e) => setName((e.target as HTMLInputElement).value)} />
          </div>

          <div>
            <label className="text-sm block mb-1">Role</label>
            <Input value={role} onChange={(e) => setRole((e.target as HTMLInputElement).value)} />
          </div>

          <div>
            <label className="text-sm block mb-1">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail((e.target as HTMLInputElement).value)} />
          </div>
        </div>

        <DialogFooter>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit}>Update</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMemberModal;
