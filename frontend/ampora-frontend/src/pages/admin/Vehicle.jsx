import { useEffect, useMemo, useState } from "react";
import Modal from "./component/Modal";
import { useLocation } from "react-router-dom";

import { Plus, Pencil, Trash2, X } from "lucide-react";
import {
  fetchVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicleApi,
  fetchVehicleBrands,
  fetchVehicleModels,
} from "./api/vehicleService";

const emptyForm = {
  variant: "",
  plate: "",
  rangeKm: "",
  connectorType: "",
  userId: "",
  brand_id: "",
  model_id: "",
};
import { fetchUser } from "./api/userService";

export default function Vehicle() {
  const location = useLocation();
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchVehicles();
        setVehicles(data || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load vehicles");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (location.state?.openAddModal) {
      openAddModal();
    }
  }, [location.state]);

  const totalVehicles = vehicles.length;

  const avgBattery = useMemo(() => {
    if (vehicles.length === 0) return 0;
    const sum = vehicles.reduce((acc, v) => acc + Number(v.rangeKm || 0), 0);
    return sum;
  }, [vehicles]);

  const avgEfficiency = useMemo(() => {
    return vehicles.reduce((count, element) => {
      if (
        element.connectorType === "CCS2" ||
        element.connectorType === "Type2" ||
        element.connectorType === "Type1" ||
        element.connectorType === "NACS"
      ) {
        return count + 1;
      }
      return count;
    }, 0);
  }, [vehicles]);

  const uniqueUsers = useMemo(() => {
    const set = new Set(vehicles.map((v) => v.userId));
    return set.size;
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return vehicles;

    return vehicles.filter((v) => {
      const matchField = (field) => {
        if (Array.isArray(field)) {
          return field.some((f) => String(f).toLowerCase().includes(term));
        }
        return String(field ?? "")
          .toLowerCase()
          .includes(term);
      };

      return (
        matchField(v.brand_name) ||
        matchField(v.model_name) ||
        matchField(v.connectorType) ||
        matchField(v.userId) ||
        matchField(v.variant) ||
        matchField(v.plate)
      );
    });
  }, [vehicles, searchTerm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (vehicle) => {
    setForm({
      variant: vehicle.variant ?? "",
      plate: vehicle.plate ?? "",
      rangeKm: vehicle.rangeKm ?? "",
      connectorType: vehicle.connectorType ?? "",
      userId: vehicle.userId ?? "",
      brand_id: vehicle.brand_id ?? "",
      model_id: vehicle.model_id ?? "",
    });
    setEditId(vehicle.vehicleId);
    setShowModal(true);
  };

  const saveVehicle = async () => {
    try {
      setSaving(true);
      setError(null);

      const payload = {
        ...form,
        brand_id: Number(form.brand_id),
        model_id: Number(form.model_id),
      };

      if (!editId) {
        const created = await createVehicle(payload);
        setVehicles((prev) => [...prev, created]);
      } else {
        const updated = await updateVehicle(editId, payload);
        setVehicles((prev) =>
          prev.map((v) => (v.vehicleId === editId ? { ...v, ...updated } : v)),
        );
      }

      setShowModal(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save vehicle");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (vehicleId) => {
    const confirmed = window.confirm("Are you sure you want to delete this?");
    if (!confirmed) return;

    try {
      await deleteVehicleApi(vehicleId);
      setVehicles((prev) => prev.filter((v) => v.vehicleId !== vehicleId));
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete vehicle");
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await fetchUser();
        setUsers(users || []);
      } catch (err) {
        console.error("Failed to load users for vehicles:", err);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const brands = await fetchVehicleBrands();
        setBrands(brands || []);
      } catch (err) {
        console.error("Failed to load vehicle brands:", err);
      }
    };
    loadBrands();
  }, []);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const models = await fetchVehicleModels();
        setModels(models || []);
      } catch (err) {
        console.error("Failed to load vehicle models:", err);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (!showModal) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showModal]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-16 my-20">
      <div className="max-w-7xl ">
        {/* Error / Loading */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {loading && (
          <div className="mb-4 text-sm text-gray-500">Loading vehicles...</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <div className="w-6 h-6 bg-blue-500 rounded-lg"></div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Total Vehicles
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {totalVehicles}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <div className="w-6 h-6 bg-green-500 rounded-lg"></div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Avg Battery</p>
                <p className="text-2xl font-bold text-gray-800">
                  {avgBattery.toFixed(0)} <span className="text-sm">kWh</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <div className="w-6 h-6 bg-purple-500 rounded-lg"></div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Connector Type
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {avgEfficiency}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <div className="w-6 h-6 bg-orange-500 rounded-lg"></div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {uniqueUsers}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Vehicle Registry
            </h2>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              />

              <button
                onClick={openAddModal}
                className="addBtn px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-sm"
              >
                <Plus size={20} /> Add Vehicle
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Model_Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Brand_Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    RangeKm
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Variant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    ConnecterType
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                    Plate
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                    User_Id
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((v) => (
                  <tr
                    key={v.vehicleId}
                    className="border-b border-gray-50 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {v.vehicleId}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {v.model_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {v.brand_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {v.rangeKm} km
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {v.variant}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-medium">
                        {v.connectorType}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {v.plate}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {v.userId}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(v)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(v.vehicleId)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && filteredVehicles.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-6 py-8 text-center text-sm text-gray-500"
                    >
                      No vehicles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editId ? "Edit Vehicle" : "Add New Vehicle"}
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 transition font-medium"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={saveVehicle}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition font-medium shadow-sm disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Saving..." : editId ? "Update Vehicle" : "Add Vehicle"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <select
            name="brand_id"
            value={form.brand_id}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="">Select Brand</option>
            {brands.map((b) => (
              <option key={b.brand_id} value={b.brand_id}>
                {b.brand_name}
              </option>
            ))}
          </select>

          <select
            name="model_id"
            value={form.model_id}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="">Select Model</option>
            {models
              .filter((m) => m.brand_id === m.model_id)
              .map((m) => (
                <option key={m.model_id} value={m.model_id}>
                  {m.model_name}
                </option>
              ))}
          </select>

          <input
            name="variant"
            placeholder="Variant"
            type="number"
            value={form.variant}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />

          <input
            name="rangeKm"
            placeholder="Range (km)"
            type="number"
            value={form.rangeKm}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />

          <input
            name="plate"
            placeholder="Plate"
            value={form.plate}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />

          <select
            name="connectorType"
            value={form.connectorType}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="">Select Connector Type</option>
            <option value="Type1">Type1</option>
            <option value="Type2">Type2</option>
            <option value="CCS">CCS</option>
            <option value="CHAdeMO">CHAdeMO</option>
          </select>

          <select
            name="userId"
            value={form.userId}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
          >
            <option value="">Select a user</option>
            {users.map((u) => (
              <option key={u.userId} value={u.userId}>
                {u.fullName} ({u.email})
              </option>
            ))}
          </select>
        </div>
      </Modal>
    </div>
  );
}
