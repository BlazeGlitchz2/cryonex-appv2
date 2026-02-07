import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Cpu, HardDrive, MemoryStick, Activity } from "lucide-react";
import { ConfirmationModal } from "../components/ConfirmationModal";

interface DiskInfo {
  name: string;
  total_space: number;
  available_space: number;
  mount_point: string;
}

interface SystemInfo {
  cpu_usage: number;
  total_memory: number;
  used_memory: number;
  total_swap: number;
  used_swap: number;
  os_name: string;
  os_version: string;
  host_name: string;
  disks: DiskInfo[];
}

export function System() {
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"ram" | "disk" | null>(null);

  const fetchInfo = async () => {
    try {
      const data = await invoke<SystemInfo>("get_system_info");
      setInfo(data);
    } catch (e) {
      console.error("Failed to fetch system info:", e);
    }
  };

  useEffect(() => {
    fetchInfo();
    const interval = setInterval(fetchInfo, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleOptimize = (type: "ram" | "disk") => {
    setActionType(type);
    setModalOpen(true);
  };

  const confirmOptimize = async () => {
    if (!actionType) return;
    try {
      // Mock optimization
      await invoke("install_program", {
        name: actionType === "ram" ? "RAM Optimizer" : "Disk Cleaner",
      });
      alert("Optimization complete!");
    } catch (e) {
      console.error(e);
    }
  };

  if (!info)
    return (
      <div className="p-8 text-white flex items-center justify-center h-full">
        <div className="animate-pulse">
          Loading system info... (Ensure backend is running)
        </div>
      </div>
    );

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-white">System Diagnostics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center gap-3 mb-4 text-blue-400">
            <Cpu size={24} />
            <h3 className="font-semibold text-white">CPU Usage</h3>
          </div>
          <div className="text-3xl font-bold text-white">
            {info.cpu_usage.toFixed(1)}%
          </div>
          <div className="w-full bg-gray-700 h-2 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-500"
              style={{ width: `${info.cpu_usage}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center gap-3 mb-4 text-purple-400">
            <MemoryStick size={24} />
            <h3 className="font-semibold text-white">Memory</h3>
          </div>
          <div className="text-3xl font-bold text-white">
            {formatBytes(info.used_memory)}
          </div>
          <div className="text-sm text-gray-400">
            of {formatBytes(info.total_memory)}
          </div>
          <div className="w-full bg-gray-700 h-2 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-purple-500 h-full transition-all duration-500"
              style={{
                width: `${(info.used_memory / info.total_memory) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* OS Info */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 col-span-2">
          <div className="flex items-center gap-3 mb-4 text-green-400">
            <Activity size={24} />
            <h3 className="font-semibold text-white">System Details</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400 block">OS Name</span>
              <span className="text-white font-medium">{info.os_name}</span>
            </div>
            <div>
              <span className="text-gray-400 block">OS Version</span>
              <span className="text-white font-medium">{info.os_version}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Hostname</span>
              <span className="text-white font-medium">{info.host_name}</span>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mt-8 mb-4">Storage</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {info.disks.map((disk, i) => (
          <div
            key={i}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700"
          >
            <div className="flex items-center gap-3 mb-4 text-yellow-400">
              <HardDrive size={24} />
              <h3 className="font-semibold text-white">
                {disk.name || "Local Disk"}
              </h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Mount Point</span>
                <span className="text-white">{disk.mount_point}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Free Space</span>
                <span className="text-white">
                  {formatBytes(disk.available_space)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Space</span>
                <span className="text-white">
                  {formatBytes(disk.total_space)}
                </span>
              </div>
              <div className="w-full bg-gray-700 h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-yellow-500 h-full"
                  style={{
                    width: `${((disk.total_space - disk.available_space) / disk.total_space) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Optimization Suggestions */}
      <h2 className="text-xl font-bold text-white mt-8 mb-4">
        AI Optimization Suggestions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {info.used_memory / info.total_memory > 0.8 ? (
          <div className="bg-gray-800 p-6 rounded-xl border border-red-500/50 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white mb-1">
                High Memory Usage
              </h3>
              <p className="text-sm text-gray-400">
                RAM usage is above 80%. Consider freeing up memory.
              </p>
            </div>
            <button
              onClick={() => handleOptimize("ram")}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Optimize RAM
            </button>
          </div>
        ) : (
          <div className="bg-gray-800 p-6 rounded-xl border border-green-500/30 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white mb-1">
                Memory Optimized
              </h3>
              <p className="text-sm text-gray-400">
                RAM usage is within healthy limits.
              </p>
            </div>
            <div className="text-green-400 text-sm font-medium">Good</div>
          </div>
        )}

        {info.disks.some((d) => d.available_space < 10 * 1024 * 1024 * 1024) ? (
          <div className="bg-gray-800 p-6 rounded-xl border border-yellow-500/50 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white mb-1">Low Disk Space</h3>
              <p className="text-sm text-gray-400">
                Less than 10GB free on one or more drives.
              </p>
            </div>
            <button
              onClick={() => handleOptimize("disk")}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Clean Junk
            </button>
          </div>
        ) : (
          <div className="bg-gray-800 p-6 rounded-xl border border-green-500/30 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white mb-1">Storage Healthy</h3>
              <p className="text-sm text-gray-400">
                Sufficient free space available.
              </p>
            </div>
            <div className="text-green-400 text-sm font-medium">Good</div>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmOptimize}
        title={actionType === "ram" ? "Optimize RAM?" : "Clean Disk Junk?"}
        description={
          actionType === "ram"
            ? "This will attempt to clear system caches and unused processes. This is safe."
            : "This will scan for temporary files and cache to free up space. No personal files will be deleted."
        }
        actionLabel="Run Optimization"
        isDangerous={false}
      />
    </div>
  );
}
