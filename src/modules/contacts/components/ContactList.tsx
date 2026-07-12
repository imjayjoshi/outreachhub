"use client";
import { useState, useEffect } from "react";
import { contactService } from "../services/contactService";
import { ContactForm } from "./ContactForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Users,
  Mail,
  Phone,
  Pencil,
  Trash2,
  ChevronRight,
  AlertTriangle,
  Building2,
  Link2,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Company {
  id: string;
  name: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role?: string | null;
  linkedinUrl?: string | null;
  companyId?: string | null;
  status: string;
  company?: Company | null;
}

const STATUS_STYLES: Record<string, string> = {
  new: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  contacted: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  replied: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

export function ContactList() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    contactService
      .list()
      .then((data) => {
        if (!cancelled) setContacts(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load contacts.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const fetchContacts = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await contactService.remove(id);
      toast.success("Contact deleted.");
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch {
      toast.error("Failed to delete contact.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered =
    statusFilter === "all"
      ? contacts
      : contacts.filter((c) => c.status === statusFilter);

  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-midnight-secondary" />
            Contacts
          </h1>
          <p className="text-xs text-midnight-muted mt-0.5">
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""} in your
            outreach pipeline.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingContact(null);
            setFormOpen(true);
          }}
          className="bg-midnight-primary hover:bg-[#4676E5] text-white font-semibold rounded-xl shadow-lg shadow-midnight-primary/10 cursor-pointer flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Contact
        </Button>
      </div>

      {/* Status filter tabs */}
      {!loading && contacts.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {["all", "new", "contacted", "replied", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer border ${
                statusFilter === s
                  ? "bg-midnight-primary text-white border-midnight-primary"
                  : "border-midnight-border text-midnight-muted hover:text-white hover:border-midnight-primary/40 bg-transparent"
              }`}
            >
              {s === "all"
                ? `All (${contacts.length})`
                : `${s} (${contacts.filter((c) => c.status === s).length})`}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-16 w-full rounded-xl bg-midnight-card/50"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && contacts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center flex-1 py-20 text-center"
        >
          <div className="h-16 w-16 rounded-2xl bg-midnight-card flex items-center justify-center mb-4 border border-midnight-border">
            <Users className="h-8 w-8 text-midnight-muted" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">
            No contacts yet
          </h3>
          <p className="text-sm text-midnight-muted max-w-xs">
            Add contacts manually to start tracking your outreach.
          </p>
          <Button
            onClick={() => setFormOpen(true)}
            className="mt-6 bg-midnight-primary hover:bg-[#4676E5] text-white font-semibold rounded-xl cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </motion.div>
      )}

      {/* Contact list */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {filtered.map((contact, idx) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.03 }}
                className="group flex items-center gap-4 rounded-xl border border-midnight-border bg-midnight-card/40 px-5 py-4 hover:border-midnight-secondary/30 hover:bg-midnight-card/70 transition-all duration-200"
              >
                {/* Avatar */}
                <div className="h-10 w-10 shrink-0 rounded-full bg-midnight-secondary/10 border border-midnight-secondary/20 flex items-center justify-center text-midnight-secondary font-bold text-sm">
                  {contact.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">
                      {contact.name}
                    </p>
                    <span
                      className={`hidden sm:inline-flex text-[10px] border px-2 py-0.5 rounded-full font-medium capitalize ${
                        STATUS_STYLES[contact.status] ??
                        "bg-midnight-card text-midnight-muted border-midnight-border"
                      }`}
                    >
                      {contact.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-midnight-muted flex-wrap">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {contact.email}
                    </span>
                    {contact.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {contact.phone}
                      </span>
                    )}
                    {contact.company && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {contact.company.name}
                      </span>
                    )}
                    {contact.role && (
                      <span className="text-midnight-muted/60">
                        {contact.role}
                      </span>
                    )}
                    {contact.linkedinUrl && (
                      <a
                        href={contact.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 hover:text-midnight-secondary transition-colors"
                      >
                        <Link2 className="h-3 w-3" />
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(contact)}
                    className="p-2 rounded-lg hover:bg-midnight-bg text-midnight-muted hover:text-white transition-colors cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    disabled={deletingId === contact.id}
                    className="p-2 rounded-lg hover:bg-rose-500/10 text-midnight-muted hover:text-rose-400 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {deletingId === contact.id ? (
                      <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => router.push(`/contacts/${contact.id}`)}
                    className="p-2 rounded-lg hover:bg-midnight-bg text-midnight-muted hover:text-midnight-secondary transition-colors cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* No results for filter */}
      {!loading && contacts.length > 0 && filtered.length === 0 && (
        <div className="text-center py-10 text-sm text-midnight-muted">
          No contacts with status &quot;{statusFilter}&quot;.
        </div>
      )}

      <ContactForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingContact(null);
        }}
        contact={editingContact}
        onSuccess={() => {
          setEditingContact(null);
          fetchContacts();
        }}
      />
    </div>
  );
}
