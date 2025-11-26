// src/pages/VehicleManager.jsx
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiZap,
  FiX,
  FiSearch,
  FiTag,
  FiSettings,
  FiChevronRight,
  FiMapPin,
  FiCpu,
  FiBattery,
  FiStar,
} from "react-icons/fi";

const glass =
  "backdrop-blur-xl bg-white/70 border border-emerald-200/60 shadow-[0_8px_35px_rgba(16,185,129,0.12)]";

const fade = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const emptyForm = {
  brand: "",
  model: "",
  variant: "",
  plate: "",
  connector: "",
  rangeKm: "",
};

const VehicleManager = () => {
  // ---------- Mock data (replace with API) ----------
  const [vehicles, setVehicles] = useState([
    {
      id: "v1",
      brand: "Nissan",
      model: "Leaf",
      variant: "40 kWh",
      plate: "WP-CAD-4123",
      connector: "CHAdeMO",
      rangeKm: 240,
      isDefault: true,
    },
    {
      id: "v2",
      brand: "BYD",
      model: "Atto 3",
      variant: "60 kWh",
      plate: "WP-KX-7821",
      connector: "CCS2",
      rangeKm: 410,
      isDefault: false,
    },
    {
      id: "v3",
      brand: "Tesla",
      model: "Model 3",
      variant: "57 kWh",
      plate: "WP-AB-9076",
      connector: "Type 2 / CCS2",
      rangeKm: 430,
      isDefault: false,
    },
  ]);

  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null); // vehicle object or null
  const [showDelete, setShowDelete] = useState(null); // vehicle object or null
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  // ---------- Derived ----------
  const filtered = useMemo(() => {
    if (!query.trim()) return vehicles;
    const q = query.toLowerCase();
    return vehicles.filter(
      (v) =>
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.variant.toLowerCase().includes(q) ||
        v.plate.toLowerCase().includes(q) ||
        String(v.rangeKm).includes(q) ||
        v.connector.toLowerCase().includes(q)
    );
  }, [vehicles, query]);

  const defaultVehicle = vehicles.find((v) => v.isDefault);

  // ---------- Handlers ----------
  const openAdd = () => {
    setForm(emptyForm);
    setErrors({});
    setShowAdd(true);
  };

  const openEdit = (v) => {
    setForm({
      brand: v.brand,
      model: v.model,
      variant: v.variant,
      plate: v.plate,
      connector: v.connector,
      rangeKm: String(v.rangeKm ?? ""),
    });
    setErrors({});
    setShowEdit(v);
  };

  const validate = () => {
    const e = {};
    if (!form.brand.trim()) e.brand = "Brand is required";
    if (!form.model.trim()) e.model = "Model is required";
    if (!form.variant.trim()) e.variant = "Battery/Variant is required";
    if (!form.plate.trim()) e.plate = "Plate is required";
    if (!form.connector.trim()) e.connector = "Connector is required";
    if (!form.rangeKm || isNaN(Number(form.rangeKm)))
      e.rangeKm = "Range (km) must be a number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addVehicle = () => {
    if (!validate()) return;
    const newV = {
      id: "v" + Math.random().toString(36).slice(2, 8),
      brand: form.brand.trim(),
      model: form.model.trim(),
      variant: form.variant.trim(),
      plate: form.plate.trim(),
      connector: form.connector.trim(),
      rangeKm: Number(form.rangeKm),
      isDefault: vehicles.length === 0, // first add becomes default
    };
    setVehicles((s) => [newV, ...s]);
    setShowAdd(false);
  };

  const saveEdit = () => {
    if (!validate() || !showEdit) return;
    setVehicles((s) =>
      s.map((v) =>
        v.id === showEdit.id
          ? {
              ...v,
              brand: form.brand.trim(),
              model: form.model.trim(),
              variant: form.variant.trim(),
              plate: form.plate.trim(),
              connector: form.connector.trim(),
              rangeKm: Number(form.rangeKm),
            }
          : v
      )
    );
    setShowEdit(null);
  };

  const confirmDelete = () => {
    if (!showDelete) return;
    const wasDefault = showDelete.isDefault;
    setVehicles((s) => s.filter((v) => v.id !== showDelete.id));
    setShowDelete(null);
    // If default deleted, set first as default
    if (wasDefault) {
      setTimeout(() => {
        setVehicles((s) =>
          s.length ? [{ ...s[0], isDefault: true }, ...s.slice(1).map((x) => ({ ...x, isDefault: false }))] : s
        );
      }, 0);
    }
  };

  const makeDefault = (id) => {
    setVehicles((s) => s.map((v) => ({ ...v, isDefault: v.id === id })));
  };

  // ---------- UI ----------
  return (
    <div className="w-screen min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-white text-gray-900">
      {/* Header */}
      <div className="mx-auto w-11/12 max-w-7xl pt-10 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-700">
              My Vehicles
            </h1>
            <p className="text-emerald-900/70">
              Add, edit, set default, and manage your EVs for smarter trip planning.
            </p>
          </div>

          <div className="flex gap-3">
            <div className={`${glass} rounded-2xl px-4 py-2 flex items-center gap-2`}>
              <FiSearch className="text-emerald-600" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search brand, model, plate…"
                className="bg-transparent outline-none text-sm text-emerald-900 placeholder-emerald-900/60"
              />
            </div>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow hover:shadow-lg"
            >
              <FiPlus /> Add Vehicle
            </button>
          </div>
        </div>
      </div>

      {/* Default vehicle pill */}
      {defaultVehicle && (
        <div className="mx-auto w-11/12 max-w-7xl">
          <div className={`${glass} rounded-2xl p-4 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600">
                <FiStar />
              </span>
              <div>
                <p className="text-sm text-emerald-900/70">Default vehicle</p>
                <p className="font-semibold text-emerald-800">
                  {defaultVehicle.brand} {defaultVehicle.model} • {defaultVehicle.variant} · {defaultVehicle.plate}
                </p>
              </div>
            </div>
            <a
              href="/trip"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              Plan with default <FiChevronRight />
            </a>
          </div>
        </div>
      )}

      {/* Grid list */}
      <div className="mx-auto w-11/12 max-w-7xl py-8">
        {filtered.length === 0 ? (
          <motion.div
            variants={fade}
            initial="hidden"
            animate="show"
            className={`${glass} rounded-2xl p-10 text-center`}
          >
            <p className="text-emerald-900/70">
              No vehicles found. Try a different search or add a new vehicle.
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={fade}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filtered.map((v) => (
              <div key={v.id} className={`${glass} rounded-2xl p-6`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid place-items-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 text-lg">
                      <FiCpu />
                    </span>
                    <div>
                      <p className="font-semibold text-emerald-900">
                        {v.brand} {v.model}
                      </p>
                      <p className="text-xs text-emerald-900/70">{v.variant}</p>
                    </div>
                  </div>

                  {v.isDefault ? (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                      <FiStar className="shrink-0" /> Default
                    </span>
                  ) : (
                    <button
                      onClick={() => makeDefault(v.id)}
                      className="text-xs px-2 py-1 rounded-full border border-emerald-300 text-emerald-500 hover:bg-emerald-50"
                    >
                      Set default
                    </button>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <InfoRow icon={<FiTag />} label="Plate" value={v.plate} />
                  <InfoRow icon={<FiBattery />} label="Range" value={`${v.rangeKm} km`} />
                  <InfoRow icon={<FiSettings />} label="Connector" value={v.connector} />
                  <InfoRow icon={<FiMapPin />} label="Used in Trip Planner" value={v.isDefault ? "Yes" : "No"} />
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <button
                    onClick={() => openEdit(v)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <FiEdit2 /> Edit
                  </button>
                  <div
                    onClick={() => setShowDelete(v)}
                    className="inline-flex cursor-pointer items-center gap-2 px-3 py-2 rounded-lg border bg-red-700 border-emerald-300 text-white hover:bg-red-800"
                  >
                    <FiTrash2 /> Delete
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* ---------- Add Modal ---------- */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Vehicle">
        <VehicleForm
          form={form}
          setForm={setForm}
          errors={errors}
          onSubmit={addVehicle}
          submitText="Add Vehicle"
        />
      </Modal>

      {/* ---------- Edit Modal ---------- */}
      <Modal open={!!showEdit} onClose={() => setShowEdit(null)} title="Edit Vehicle">
        <VehicleForm
          form={form}
          setForm={setForm}
          errors={errors}
          onSubmit={saveEdit}
          submitText="Save Changes"
        />
      </Modal>

      {/* ---------- Delete Confirm ---------- */}
      <ConfirmDialog
        open={!!showDelete}
        title="Delete vehicle?"
        message={
          showDelete
            ? `Are you sure you want to delete ${showDelete.brand} ${showDelete.model} (${showDelete.plate})?`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => setShowDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 rounded-xl bg-white/60 border border-emerald-200/60 px-3 py-2">
    <span className="text-emerald-600">{icon}</span>
    <div className="text-emerald-900/80">
      <span className="text-xs">{label}</span>
      <div className="font-semibold text-emerald-900 leading-tight">{value}</div>
    </div>
  </div>
);

/* ----------------- Reusable Modal ----------------- */
const Modal = ({ open, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] grid place-items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            onClick={onClose}
            className="absolute inset-0 bg-black/40"
            aria-hidden
          />
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className={`${glass} w-[95%] max-w-xl rounded-2xl p-5 relative`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-emerald-800">{title}</h3>
              <button
                onClick={onClose}
                className="grid place-items-center w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              >
                <FiX />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ------------- Vehicle Form (Add / Edit) ------------- */
const VehicleForm = ({ form, setForm, errors, onSubmit, submitText }) => {
  const field = (name, label, placeholder, type = "text") => (
    <div className="flex flex-col">
      <label className="text-xs font-semibold text-emerald-800 mb-1">{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
        placeholder={placeholder}
        className={`rounded-xl border px-3 py-2 outline-none bg-white/80 text-black 
          ${errors[name] ? "border-red-300 focus:ring-2 focus:ring-red-400" : "border-emerald-300 focus:ring-2 focus:ring-emerald-400"}`}
      />
      {errors[name] && <span className="text-xs text-red-600 mt-1">{errors[name]}</span>}
    </div>
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field("brand", "Brand", "Nissan / BYD / Tesla")}
        {field("model", "Model", "Leaf / Atto 3 / Model 3")}
        {field("variant", "Battery / Variant", "40 kWh / 60 kWh")}
        {field("plate", "Plate Number", "WP-CAD-4123")}
        {field("connector", "Connector", "CHAdeMO / CCS2 / Type 2")}
        {field("rangeKm", "Range (km)", "400", "number")}
      </div>

      <div className="pt-2 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
        >
          {submitText}
        </button>
      </div>
    </form>
  );
};

/* ------------- Confirm Dialog ------------- */
const ConfirmDialog = ({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div onClick={onCancel} className="absolute inset-0 bg-black/40" aria-hidden />
          <motion.div
            initial={{ y: 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className={`${glass} w-[92%] max-w-md rounded-2xl p-5`}
          >
            <h3 className="text-lg font-bold text-emerald-800">{title}</h3>
            <p className="mt-2 text-emerald-900/80">{message}</p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VehicleManager;
