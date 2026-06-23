// Project/[projectId]/board/components/CardDetailModal.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Calendar, Paperclip, Trash2, FileText, Image as ImageIcon,
  File, AlignLeft, Upload, Loader2, MessageSquare, Send, Pencil,
  Check, Users, Plus, UserMinus, Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useCardsApi } from "@/lib/api/cards";
import { useProjectMembers, Member } from "../../team/hooks/useProjectMembers";
import { uploadFileToStorage, deleteFileFromStorage } from "@/lib/api/storage";
import { useCommentsApi, Comment } from "@/lib/api/comments";
import { toast } from "sonner";

interface Attachment {
  id: string; card_id: string; file_url: string;
  file_name: string; uploaded_by: string; created_at: string;
}
interface CardMember {
  id: string; card_id: string; clerk_user_id: string;
}
interface CardDetailPayload {
  id: string; title: string; description?: string;
  dueDate?: string | null; progress?: number;
}
interface Props {
  open: boolean; payload: CardDetailPayload | null;
  projectId: string; onClose: () => void;
  onSave: (mode: string, data: any) => void; isAdmin?: boolean;
}

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

const formatRelative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} mnt lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(diff / 86400000)} hari lalu`;
};

const openFile = (url: string, name: string) => {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
    window.open(url, "_blank", "noopener,noreferrer");
  } else {
    const a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }
};

const fileIcon = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext ?? ""))
    return <ImageIcon className="w-4 h-4 text-purple-400" />;
  if (ext === "pdf") return <FileText className="w-4 h-4 text-red-400" />;
  return <File className="w-4 h-4 text-slate-400" />;
};

const avatarColor = (name: string) => {
  const colors = ["bg-red-500/30 text-red-300", "bg-blue-500/30 text-blue-300",
    "bg-green-500/30 text-green-300", "bg-purple-500/30 text-purple-300", "bg-amber-500/30 text-amber-300"];
  return colors[(name.charCodeAt(0) || 0) % colors.length];
};

type RightTab = "comments" | "files";

export default function CardDetailModal({
  open, payload, projectId, onClose, onSave, isAdmin = false,
}: Props) {
  const { user } = useUser();
  const cardsApi = useCardsApi();
  const commentsApi = useCommentsApi();
  const { members } = useProjectMembers(projectId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [progress, setProgress] = useState(0);

  // Assignment
  const [cardMembers, setCardMembers] = useState<CardMember[]>([]);
  const [loadingAssign, setLoadingAssign] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);

  // Files
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [saving, setSaving] = useState(false);

  // Comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const [tab, setTab] = useState<RightTab>("comments");

  // ── Permission: assignee = bisa komentar & upload ────────────
  const isAssignee = cardMembers.some((cm) => cm.clerk_user_id === user?.id);
  const canInteract = isAdmin || isAssignee;

  const resolveName = (clerkUserId: string) => {
    if (clerkUserId === user?.id) return "Kamu";
    const m = members.find((m) => m.clerk_user_id === clerkUserId);
    return m ? `${m.name ?? "Member"} (${m.role ?? ""})` : "Member";
  };

  const getInitial = (clerkUserId: string) => {
    if (clerkUserId === user?.id) return user?.firstName?.[0]?.toUpperCase() ?? "K";
    const m = members.find((m) => m.clerk_user_id === clerkUserId);
    return (m?.name?.[0] ?? "M").toUpperCase();
  };

  const unassignedMembers = members.filter(
    (m) => !cardMembers.some((cm) => cm.clerk_user_id === m.clerk_user_id)
  );

  useEffect(() => {
    if (!open || !payload) return;
    setTitle(payload.title ?? "");
    setDescription(payload.description ?? "");
    setDueDate(payload.dueDate ?? "");
    setProgress(payload.progress ?? 0);
    setEditingId(null);
    setNewComment("");
    setAssignOpen(false);

    setLoadingAssign(true);
    cardsApi.getCardMembers(payload.id)
      .then(setCardMembers).catch(() => setCardMembers([]))
      .finally(() => setLoadingAssign(false));

    setLoadingFiles(true);
    cardsApi.getAttachments(payload.id)
      .then(setAttachments).catch(() => setAttachments([]))
      .finally(() => setLoadingFiles(false));

    setLoadingComments(true);
    commentsApi.getComments(payload.id)
      .then(setComments).catch(() => setComments([]))
      .finally(() => setLoadingComments(false));
  }, [open, payload?.id]);

  const handleSave = async () => {
    if (!title.trim() || !payload) return;
    setSaving(true);
    try {
      onSave("editCard", { ...payload, title: title.trim(), description, dueDate: dueDate || null });
      toast.success("Card berhasil disimpan");
    } catch (err) {
      toast.error("Gagal menyimpan card");
    } finally {
      setSaving(false);
    }
  };

  // ── ASSIGNMENT ───────────────────────────────────────────────
  const handleAssign = async (member: Member) => {
    if (!payload) return;
    setAssigning(member.clerk_user_id);
    try {
      await cardsApi.assignUser(payload.id, member.clerk_user_id);
      setCardMembers((prev) => [...prev, {
        id: Math.random().toString(36),
        card_id: payload.id,
        clerk_user_id: member.clerk_user_id,
      }]);
      setAssignOpen(false);
      toast.success(`${member.name ?? "Member"} berhasil di-assign`);
    } catch (err) {
      toast.error("Gagal assign member");
    } finally {
      setAssigning(null);
    }
  };

  const handleUnassign = async (clerkUserId: string) => {
    if (!payload) return;
    const name = resolveName(clerkUserId);
    try {
      await cardsApi.unassignUser(payload.id, clerkUserId);
      setCardMembers((prev) => prev.filter((cm) => cm.clerk_user_id !== clerkUserId));
      toast.success(`${name} berhasil dihapus dari assignee`);
    } catch (err) {
      toast.error("Gagal menghapus assignee");
    }
  };

  // ── FILE ────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!payload || !canInteract) return;
    const picked = Array.from(e.target.files ?? []);
    if (!picked.length) return;
    setUploadingFile(true);
    try {
      for (const file of picked) {
        const { publicUrl } = await uploadFileToStorage(file, payload.id);
        const uploaded = await cardsApi.uploadAttachment({ card_id: payload.id, file_url: publicUrl, file_name: file.name });
        setAttachments((prev) => [uploaded, ...prev]);
        toast.success(`File "${file.name}" berhasil diupload`);
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Upload file gagal");
    } finally {
      setUploadingFile(false);
      e.target.value = "";
    }
  };

  const handleDeleteFile = async (attachment: Attachment) => {
    if (!canInteract) return;
    try {
      await deleteFileFromStorage(attachment.file_url);
      await cardsApi.deleteAttachment(attachment.id);
      setAttachments((prev) => prev.filter((f) => f.id !== attachment.id));
      toast.success(`File "${attachment.file_name}" berhasil dihapus`);
    } catch (err) {
      toast.error("Gagal menghapus file");
    }
  };

  // ── COMMENT ─────────────────────────────────────────────────
  const handleSendComment = async () => {
    if (!newComment.trim() || !payload || !canInteract) return;
    setSendingComment(true);
    try {
      const created = await commentsApi.createComment(payload.id, newComment.trim());
      setComments((prev) => [...prev, created]);
      setNewComment("");
      toast.success("Komentar berhasil dikirim");
    } catch (err) {
      toast.error("Gagal mengirim komentar");
    } finally {
      setSendingComment(false);
    }
  };

  const handleEditComment = async (id: string) => {
    if (!editContent.trim() || !canInteract) return;
    try {
      const updated = await commentsApi.updateComment(id, editContent.trim());
      setComments((prev) => prev.map((c) => c.id === id ? updated : c));
      setEditingId(null);
      toast.success("Komentar berhasil diperbarui");
    } catch (err) {
      toast.error("Gagal memperbarui komentar");
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!canInteract) return;
    try {
      await commentsApi.deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
      toast.success("Komentar berhasil dihapus");
    } catch (err) {
      toast.error("Gagal menghapus komentar");
    }
  };

  const dueBadgeClass = () => {
    if (!dueDate) return "";
    const days = (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (days < 0) return "bg-red-500/20 text-red-400 border-red-500/30";
    if (days < 2) return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  };

  const pc = progress === 100 ? "#22c55e" : progress >= 50 ? "#3b82f6" : "#9ca3af";
  const progressLabel = progress === 100 ? "Selesai ✓"
    : progress === 50 ? "Sedang dikerjakan" : "Belum dikerjakan";

  // ── Banner untuk non-assignee ────────────────────────────────
  const ReadOnlyBanner = () => (
    <div className="mx-3 mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/8 text-slate-600">
      <Lock className="w-3.5 h-3.5 flex-shrink-0" />
      <p className="text-[11px]">Kamu bukan assignee card ini — hanya bisa melihat.</p>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl w-full p-0 bg-[#0f0f11] border border-white/10 text-white overflow-hidden rounded-2xl shadow-2xl shadow-black/60 gap-0">
        <DialogTitle className="hidden">Card Detail</DialogTitle>

        {/* TOP BAR */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Card Detail</span>
          </div>
          {/* Badge read-only di top bar untuk non-assignee */}
          {!canInteract && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
              <Lock className="w-3 h-3 text-slate-500" />
              <span className="text-[10px] text-slate-500 font-medium">Read Only</span>
            </div>
          )}
        </div>

        {/* BODY */}
        <div className="flex h-[72vh] overflow-hidden">

          {/* LEFT — form */}
          <div className="flex-1 flex flex-col overflow-y-auto px-6 py-5 space-y-5 border-r border-white/8">

            <Input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul card..." disabled={!isAdmin}
              className="bg-transparent border-none text-xl font-semibold text-white placeholder:text-slate-600 focus-visible:ring-0 px-0 py-1 h-auto" />

            {/* Due Date */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                <Calendar className="w-3.5 h-3.5" /><span>Due Date</span>
              </div>
              {dueDate
                ? <Badge className={cn("text-xs border px-2.5 py-0.5 font-medium rounded-full", dueBadgeClass())}>
                    {new Date(dueDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                  </Badge>
                : <span className="text-xs text-slate-600">Belum diset</span>}
              {isAdmin && (
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                  className="ml-auto bg-white/5 border border-white/10 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-red-500/50" />
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                <AlignLeft className="w-3.5 h-3.5" /><span>Deskripsi</span>
              </div>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder={isAdmin ? "Tambah deskripsi..." : "Tidak ada deskripsi."} disabled={!isAdmin}
                rows={3} className="bg-white/[0.03] border border-white/8 text-slate-300 placeholder:text-slate-600 text-sm resize-none rounded-xl focus-visible:ring-1 focus-visible:ring-red-500/40" />
            </div>

            {/* ── ASSIGNMENT ── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                  <Users className="w-3.5 h-3.5" />
                  <span>Assignee</span>
                  {cardMembers.length > 0 && (
                    <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded-full text-slate-500">
                      {cardMembers.length}
                    </span>
                  )}
                </div>
                {isAdmin && (
                  <div className="relative">
                    <button
                      onClick={() => setAssignOpen((v) => !v)}
                      className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-red-400 transition px-2 py-1 rounded-lg hover:bg-white/5"
                    >
                      <Plus className="w-3 h-3" /> Assign
                    </button>
                    {assignOpen && (
                      <div className="absolute right-0 top-full mt-1 w-52 bg-[#1a1a20] border border-white/10 rounded-xl shadow-xl z-10 overflow-hidden">
                        {unassignedMembers.length === 0 ? (
                          <p className="text-xs text-slate-600 text-center py-4">Semua member sudah di-assign</p>
                        ) : (
                          unassignedMembers.map((m) => (
                            <button key={m.clerk_user_id} onClick={() => handleAssign(m)}
                              disabled={assigning === m.clerk_user_id}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/[0.05] transition text-left">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${avatarColor(m.name ?? "M")}`}>
                                {(m.name?.[0] ?? "M").toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-300 truncate">{m.name}</p>
                                <p className="text-[10px] text-slate-600">{m.role}</p>
                              </div>
                              {assigning === m.clerk_user_id && (
                                <Loader2 className="w-3 h-3 animate-spin text-slate-500 flex-shrink-0" />
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {loadingAssign ? (
                <div className="flex items-center gap-1 text-[10px] text-slate-600">
                  <Loader2 className="w-3 h-3 animate-spin" /> Memuat...
                </div>
              ) : cardMembers.length === 0 ? (
                <p className="text-[11px] text-slate-600">Belum ada assignee{isAdmin ? " — klik Assign untuk menambah" : ""}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {cardMembers.map((cm) => {
                    const name = resolveName(cm.clerk_user_id);
                    const initial = getInitial(cm.clerk_user_id);
                    return (
                      <div key={cm.clerk_user_id}
                        className="group flex items-center gap-1.5 bg-white/[0.04] border border-white/8 rounded-full pl-1 pr-2 py-1 hover:border-white/15 transition">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${avatarColor(name)}`}>
                          {initial}
                        </div>
                        <span className="text-[11px] text-slate-300">{name}</span>
                        {isAdmin && (
                          <button onClick={() => handleUnassign(cm.clerk_user_id)}
                            className="opacity-0 group-hover:opacity-100 ml-0.5 transition" title="Hapus assignee">
                            <UserMinus className="w-3 h-3 text-slate-600 hover:text-red-400" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                  <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: pc }} />
                  <span>Progress</span>
                </div>
                <span className="text-xs font-semibold" style={{ color: pc }}>{progress}% · {progressLabel}</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: pc }} />
              </div>
              <p className="text-[10px] text-slate-600">Otomatis berubah saat card dipindah antar kolom</p>
            </div>

            {isAdmin && (
              <Button onClick={handleSave} disabled={!title.trim() || saving}
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl mt-auto">
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Menyimpan...</> : "Simpan Perubahan"}
              </Button>
            )}
          </div>

          {/* RIGHT — tabs */}
          <div className="w-72 flex flex-col overflow-hidden">
            <div className="flex border-b border-white/8 flex-shrink-0">
              {([
                { key: "comments" as const, icon: <MessageSquare className="w-3.5 h-3.5" />, label: `Komentar (${comments.length})` },
                { key: "files" as const, icon: <Paperclip className="w-3.5 h-3.5" />, label: `File (${attachments.length})` },
              ]).map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={cn("flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition border-b-2",
                    tab === t.key ? "border-red-500 text-red-400" : "border-transparent text-slate-500 hover:text-slate-300")}>
                  {t.icon}{t.label}
                </button>
              ))}
            </div>

            {/* COMMENTS */}
            {tab === "comments" && (
              <div className="flex flex-col flex-1 overflow-hidden">

                {/* Banner non-assignee */}
                {!canInteract && <ReadOnlyBanner />}

                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.08)_transparent]">
                  {loadingComments && (
                    <div className="flex justify-center mt-6">
                      <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                    </div>
                  )}
                  {!loadingComments && comments.length === 0 && (
                    <div className="text-center mt-6">
                      <div className="text-2xl mb-1">💬</div>
                      <p className="text-xs text-slate-600">Belum ada komentar</p>
                    </div>
                  )}
                  {comments.map((c) => {
                    const isOwn = c.clerk_user_id === user?.id;
                    // Hanya assignee/admin yang bisa edit/hapus komentar mereka sendiri
                    const canEditThis = isOwn && canInteract;
                    const canDeleteThis = (isAdmin || isOwn) && canInteract;
                    return (
                      <div key={c.id} className="group">
                        <div className="flex items-baseline justify-between mb-0.5">
                          <span className="text-[11px] font-semibold text-slate-300">{resolveName(c.clerk_user_id)}</span>
                          <span className="text-[10px] text-slate-600">{formatRelative(c.created_at)}</span>
                        </div>
                        {editingId === c.id ? (
                          <div className="flex gap-1.5 mt-1">
                            <input autoFocus value={editContent} onChange={(e) => setEditContent(e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter") handleEditComment(c.id); if (e.key === "Escape") setEditingId(null); }}
                              className="flex-1 bg-white/5 border border-white/10 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-red-500/40" />
                            <button onClick={() => handleEditComment(c.id)}
                              className="p-1.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/40 transition">
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-start gap-1.5">
                            <p className="flex-1 text-xs text-slate-400 bg-white/[0.03] border border-white/8 rounded-xl px-3 py-2 leading-relaxed">
                              {c.content}
                            </p>
                            {(canEditThis || canDeleteThis) && (
                              <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                                {canEditThis && (
                                  <button onClick={() => { setEditingId(c.id); setEditContent(c.content); }}
                                    className="p-1 rounded text-slate-600 hover:text-slate-300 transition">
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                )}
                                {canDeleteThis && (
                                  <button onClick={() => handleDeleteComment(c.id)}
                                    className="p-1 rounded text-slate-600 hover:text-red-400 transition">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Input komentar — hanya untuk assignee/admin */}
                {canInteract ? (
                  <div className="border-t border-white/8 p-3 flex gap-2 flex-shrink-0">
                    <input value={newComment} onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendComment(); } }}
                      placeholder="Tulis komentar..."
                      className="flex-1 bg-white/[0.03] border border-white/8 text-slate-300 placeholder:text-slate-600 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-red-500/40" />
                    <button onClick={handleSendComment} disabled={!newComment.trim() || sendingComment}
                      className="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50 flex-shrink-0">
                      {sendingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-white/8 p-3 flex-shrink-0">
                    <p className="text-center text-[11px] text-slate-700">
                      Hanya assignee yang dapat mengirim komentar
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* FILES */}
            {tab === "files" && (
              <div className="flex flex-col flex-1 overflow-hidden">

                {/* Banner non-assignee */}
                {!canInteract && <ReadOnlyBanner />}

                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.08)_transparent]">
                  {loadingFiles && (
                    <div className="flex justify-center mt-6">
                      <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                    </div>
                  )}
                  {!loadingFiles && attachments.length === 0 && (
                    <div className="text-center mt-6">
                      <div className="text-2xl mb-1">📎</div>
                      <p className="text-xs text-slate-600">Belum ada file</p>
                    </div>
                  )}
                  {attachments.map((f) => {
                    // Tombol hapus file: hanya admin atau assignee yang upload file itu
                    const canDeleteFile = isAdmin || (isAssignee && f.uploaded_by === user?.id);
                    return (
                      <div key={f.id} className="group flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/8 hover:border-white/15 transition">
                        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                          {fileIcon(f.file_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <button onClick={() => openFile(f.file_url, f.file_name)}
                            className="text-xs font-medium text-slate-300 hover:text-white truncate block transition text-left w-full">
                            {f.file_name}
                          </button>
                          <div className="text-[10px] text-slate-600 mt-0.5 truncate">
                            {resolveName(f.uploaded_by)} · {formatTime(f.created_at)}
                          </div>
                        </div>
                        {canDeleteFile && (
                          <button onClick={() => handleDeleteFile(f)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-600 hover:text-red-400 transition flex-shrink-0">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Upload button — hanya untuk assignee/admin */}
                <div className="border-t border-white/8 p-3 flex-shrink-0">
                  <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
                  {canInteract ? (
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploadingFile}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-white/15 text-slate-500 hover:border-red-500/40 hover:text-red-400 transition text-xs font-medium disabled:opacity-50">
                      {uploadingFile
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Mengupload...</>
                        : <><Upload className="w-3.5 h-3.5" /> Upload File</>}
                    </button>
                  ) : (
                    <p className="text-center text-[11px] text-slate-700">
                      Hanya assignee yang dapat mengupload file
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}