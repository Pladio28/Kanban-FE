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
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (clerk_user_id: string, role: string) => Promise<void>;
  users: UserOption[];
}

const AddMemberModal: FC<Props> = ({
  isOpen,
  onClose,
  onAddMember,
  users,
}) => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [role, setRole] = useState("DEVELOPER"); // bukan "Member"
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!selectedUserId) {
      toast.warning("Pilih user terlebih dahulu");
      return;
    }

    try {
      setLoading(true);
      await onAddMember(selectedUserId, role);
      toast.success("Member berhasil ditambahkan");
      setSelectedUserId("");
      setRole("Member");
      onClose();
    } catch (err) {
      toast.error("Gagal menambahkan member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-black/80 backdrop-blur-xl border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-300">User</label>
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

          <div>
            <label className="text-sm text-gray-300">Role</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
              <SelectItem value="PM">PM</SelectItem>
              <SelectItem value="DEVELOPER">DEVELOPER</SelectItem>
              <SelectItem value="QA">QA</SelectItem>
              <SelectItem value="UIUX">UIUX</SelectItem>
              <SelectItem value="DEVOPS">DEVOPS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? "Adding..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberModal;
