"use client";

import React, { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserOption } from "../hooks/useUsers";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (clerk_user_id: string, role: string) => Promise<void>;
  users: UserOption[];
  isAdmin?: boolean;
}

const AddMemberModal: FC<Props> = ({
  isOpen,
  onClose,
  onAddMember,
  users,
  isAdmin,
}) => {
  // ❗ Kalau bukan admin → modal tidak akan muncul
  if (!isAdmin) return null;

  const [selectedUserId, setSelectedUserId] = useState("");
  const [role, setRole] = useState("Member");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!selectedUserId) return;
    try {
      setLoading(true);
      await onAddMember(selectedUserId, role);
      setSelectedUserId("");
      setRole("Member");
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* USER SELECT */}
          <div>
            <label>User</label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select user" />
              </SelectTrigger>

              <SelectContent>
                {users.length === 0 ? (
                  <div className="p-2 text-sm text-slate-500">
                    All users already added
                  </div>
                ) : (
                  users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* ROLE SELECT */}
          <div>
            <label>Role</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* FOOTER */}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button onClick={submit} disabled={loading || !selectedUserId}>
            {loading ? "Adding..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberModal;
