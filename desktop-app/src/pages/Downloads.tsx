import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Download, Check, Loader2 } from "lucide-react";
import { ConfirmationModal } from "../components/ConfirmationModal";

interface App {
    id: string;
    name: string;
    description: string;
    version: string;
    isInstalled: boolean;
}

const MOCK_APPS: App[] = [
    { id: "vscode", name: "Visual Studio Code", description: "Code editing. Redefined.", version: "1.85.0", isInstalled: false },
    { id: "chrome", name: "Google Chrome", description: "Fast, secure web browser.", version: "120.0", isInstalled: true },
    { id: "nodejs", name: "Node.js", description: "JavaScript runtime built on Chrome's V8.", version: "20.10.0", isInstalled: false },
    { id: "docker", name: "Docker Desktop", description: "Containerize your applications.", version: "4.26.0", isInstalled: false },
    { id: "spotify", name: "Spotify", description: "Music for everyone.", version: "1.2.26", isInstalled: true },
];

export function Downloads() {
    const [apps, setApps] = useState<App[]>(MOCK_APPS);
    const [installingId, setInstallingId] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<App | null>(null);

    const handleInstallClick = (app: App) => {
        setSelectedApp(app);
        setModalOpen(true);
    };

    const confirmInstall = async () => {
        if (!selectedApp) return;

        setInstallingId(selectedApp.id);
        try {
            await invoke("install_program", { name: selectedApp.name });

            // Update state to show installed
            setApps(apps.map(a => a.id === selectedApp.id ? { ...a, isInstalled: true } : a));

            // Show success notification (mock)
            console.log(`Installed ${selectedApp.name}`);
        } catch (error) {
            console.error("Installation failed:", error);
            alert("Installation failed. Check logs.");
        } finally {
            setInstallingId(null);
            setSelectedApp(null);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-white mb-8">Downloads Manager</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {apps.map((app) => (
                    <div key={app.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-center justify-between group hover:border-blue-500/50 transition">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-semibold text-white">{app.name}</h3>
                                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{app.version}</span>
                            </div>
                            <p className="text-gray-400 text-sm">{app.description}</p>
                        </div>

                        <div className="ml-4">
                            {app.isInstalled ? (
                                <div className="flex items-center gap-2 text-green-400 px-4 py-2 bg-green-900/20 rounded-lg">
                                    <Check size={18} />
                                    <span className="font-medium">Installed</span>
                                </div>
                            ) : installingId === app.id ? (
                                <div className="flex items-center gap-2 text-blue-400 px-4 py-2 bg-blue-900/20 rounded-lg">
                                    <Loader2 size={18} className="animate-spin" />
                                    <span className="font-medium">Installing...</span>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleInstallClick(app)}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-medium"
                                >
                                    <Download size={18} />
                                    <span>Install</span>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <ConfirmationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={confirmInstall}
                title={`Install ${selectedApp?.name}?`}
                description={`Are you sure you want to install ${selectedApp?.name} version ${selectedApp?.version}? This will download and run the installer on your system.`}
                actionLabel="Install Now"
                isDangerous={false}
            />
        </div>
    );
}
