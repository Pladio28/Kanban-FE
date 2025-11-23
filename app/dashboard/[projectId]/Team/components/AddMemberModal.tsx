"use client";

import React, { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (name: string, role: string, email: string) => void;
}

const AddMemberModal: FC<Props> = ({ isOpen, onClose, onAddMember }) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (!name.trim() || !email.trim()) return;
    onAddMember(name.trim(), role.trim() || "Member", email.trim());
    setName("");
    setRole("");
    setEmail("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <div>
            <label className="text-sm block mb-1">Name</label>
            <Input value={name} onChange={(e) => setName((e.target as HTMLInputElement).value)} />
          </div>

          <div>
            <label className="text-sm block mb-1">Role</label>
            <Input value={role} onChange={(e) => setRole((e.target as HTMLInputElement).value)} placeholder="Developer / Designer / Member" />
          </div>

          <div>
            <label className="text-sm block mb-1">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail((e.target as HTMLInputElement).value)} />
          </div>
        </div>

        <DialogFooter>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit}>Add</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberModal;
