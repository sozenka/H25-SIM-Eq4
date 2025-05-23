// Paramètres.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, X } from "lucide-react";

const Settings = () => {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const [modalType, setModalType] = useState<"email" | "username" | "password" | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  // Ouvrir le modal de modification
  const openModal = (type: "email" | "username" | "password") => {
    setModalType(type);
    setModalOpen(true);
    setInputValue("");
    setConfirmPassword("");
    setMessage("");
  };

  // Fermer le modal de modification
  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => setModalType(null), 300);
  };

  // Gérer la mise à jour des informations
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (modalType === "password" && inputValue !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          field: modalType,
          value: inputValue,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Échec de la mise à jour");

      setMessage("Mise à jour réussie.");
      localStorage.setItem("user", JSON.stringify(data.user));
      closeModal();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 px-4 text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">Paramètres de l'utilisateur</h1>

      <div className="space-y-6">
        {[
          { label: "Nom d'utilisateur", value: currentUser.username, type: "username" },
          { label: "Courriel", value: currentUser.email, type: "email" },
          { label: "Mot de passe", value: "••••••••", type: "password" },
        ].map(({ label, value, type }) => (
          <div key={type} className="bg-white/5 p-4 rounded-2xl flex justify-between items-center border border-white/10">
            <div>
              <h3 className="text-sm text-gray-400">{label}</h3>
              <p className="text-lg font-medium">{value}</p>
            </div>
            <button onClick={() => openModal(type as any)} className="text-sm hover:text-purple-400 transition">
              <Pencil className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {modalOpen && modalType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-zinc-900 border border-white/10 p-6 rounded-2xl w-full max-w-md relative"
            >
              <button onClick={closeModal} className="absolute top-3 right-3 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-semibold mb-4">Modifier {modalType}</h2>
              <form className="space-y-4" onSubmit={handleUpdate}>
                <input
                  type={modalType === "password" ? "password" : "text"}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={`Nouveau ${modalType}`}
                  className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-white/10"
                />
                {modalType === "password" && (
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmer le mot de passe"
                    className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-white/10"
                  />
                )}
                {message && <p className="text-sm text-red-400">{message}</p>}
                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg font-semibold transition"
                >
                  Mettre à jour
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
