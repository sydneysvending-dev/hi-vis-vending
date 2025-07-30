import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Camera } from "lucide-react";

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export default function QRScanner({ onScan, onClose, isLoading }: QRScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    // Request camera permission
    const requestPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasPermission(true);
        // Stop the stream for now
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        setHasPermission(false);
      }
    };

    requestPermission();
  }, []);

  // Simulate QR scanning for demo purposes
  const simulateScan = () => {
    // Generate a simulated Hi-Vis machine QR code
    const machineId = `HIVIS_MACHINE_${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`;
    onScan(machineId);
  };

  if (hasPermission === null) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
        <div className="text-center text-white">
          <Camera className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <p>Requesting camera permission...</p>
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
        <div className="bg-slate-800 rounded-lg p-6 mx-4 text-center">
          <Camera className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-white text-lg font-semibold mb-2">Camera Access Required</h3>
          <p className="text-slate-300 mb-4">
            Please allow camera access to scan QR codes
          </p>
          <Button onClick={onClose} className="bg-orange-500 hover:bg-orange-600 text-slate-800">
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-800">
          <h2 className="text-white text-lg font-semibold">Scan QR Code</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-slate-700"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Scanner Area */}
        <div className="flex-1 relative bg-black flex items-center justify-center">
          {/* Demo scanner frame */}
          <div className="relative">
            <div className="w-64 h-64 border-4 border-orange-500 rounded-xl relative">
              {/* Corner indicators */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-yellow-400 rounded-tl-xl"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-yellow-400 rounded-tr-xl"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-yellow-400 rounded-bl-xl"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-yellow-400 rounded-br-xl"></div>
              
              {/* Scanner content */}
              <div className="absolute inset-0 flex items-center justify-center">
                {isLoading ? (
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-white text-sm">Processing...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-white mx-auto mb-2" />
                    <p className="text-white text-sm">Point at QR code</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-slate-800">
          <p className="text-white text-center text-sm mb-4">
            Hold steady and align QR code within frame
          </p>
          
          {/* Demo button for testing */}
          <Button 
            onClick={simulateScan}
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-slate-800 font-semibold"
          >
            {isLoading ? "Processing..." : "Simulate Scan (Demo)"}
          </Button>
        </div>
      </div>
    </div>
  );
}
