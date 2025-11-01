import { Loader2 } from "lucide-react";

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <h1 className="text-2xl font-bold text-white">MUNDERO</h1>
        </div>
        <p className="text-slate-400">Cargando plataforma...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
