import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, RefreshCw, Copy, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeGeneratorProps {
  userId: string;
  userTier: string;
  totalPoints: number;
}

export function QRCodeGenerator({ userId, userTier, totalPoints }: QRCodeGeneratorProps) {
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [qrCodeSvg, setQrCodeSvg] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Generate QR code data with user info and timestamp
  const generateQRCode = () => {
    setIsGenerating(true);
    
    const qrData = {
      userId,
      timestamp: Date.now(),
      tier: userTier,
      points: totalPoints,
      type: 'hi-vis-customer',
      // Add random token for security
      token: Math.random().toString(36).substring(2, 15)
    };

    const qrString = JSON.stringify(qrData);
    setQrCodeData(qrString);
    
    // Generate SVG QR code
    generateQRCodeSVG(qrString);
    
    setTimeout(() => setIsGenerating(false), 500);
  };

  const generateQRCodeSVG = (data: string) => {
    // Simple QR code SVG generator (placeholder - in production use a real QR library)
    const size = 200;
    const modules = 25; // QR code grid size
    const moduleSize = size / modules;
    
    let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="white"/>`;
    
    // Generate pseudo-random pattern based on data hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash + data.charCodeAt(i)) & 0xffffffff;
    }
    
    for (let y = 0; y < modules; y++) {
      for (let x = 0; x < modules; x++) {
        // Create finder patterns (corners)
        const isFinderPattern = 
          (x < 7 && y < 7) || 
          (x >= modules - 7 && y < 7) || 
          (x < 7 && y >= modules - 7);
        
        if (isFinderPattern) {
          if ((x === 0 || x === 6 || y === 0 || y === 6) ||
              (x >= 2 && x <= 4 && y >= 2 && y <= 4)) {
            svg += `<rect x="${x * moduleSize}" y="${y * moduleSize}" 
                     width="${moduleSize}" height="${moduleSize}" fill="black"/>`;
          }
        } else {
          // Generate data pattern
          const seed = (hash + x * 31 + y * 17) % 100;
          if (seed > 50) {
            svg += `<rect x="${x * moduleSize}" y="${y * moduleSize}" 
                     width="${moduleSize}" height="${moduleSize}" fill="black"/>`;
          }
        }
      }
    }
    
    svg += '</svg>';
    setQrCodeSvg(svg);
  };

  const copyQRData = async () => {
    try {
      await navigator.clipboard.writeText(qrCodeData);
      setCopied(true);
      toast({
        title: "QR Code Data Copied",
        description: "QR code data copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy QR code data",
        variant: "destructive",
      });
    }
  };

  // Generate initial QR code
  useEffect(() => {
    generateQRCode();
  }, [userId, userTier, totalPoints]);

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'foreman': return 'text-yellow-400';
      case 'tradie': return 'text-blue-400';
      default: return 'text-green-400';
    }
  };

  return (
    <Card className="bg-slate-700 border-slate-600">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <QrCode className="w-5 h-5 mr-2 text-orange-500" />
          Your Personal QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="bg-white p-4 rounded-lg inline-block mb-4">
            {qrCodeSvg ? (
              <div dangerouslySetInnerHTML={{ __html: qrCodeSvg }} />
            ) : (
              <div className="w-48 h-48 bg-slate-200 rounded flex items-center justify-center">
                <QrCode className="w-16 h-16 text-slate-400" />
              </div>
            )}
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="text-white">
              <span className="text-slate-400">Tier: </span>
              <span className={getTierColor(userTier)}>{userTier}</span>
            </div>
            <div className="text-white">
              <span className="text-slate-400">Points: </span>
              <span className="text-orange-400">{totalPoints}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-slate-800 p-3 rounded-lg">
            <h4 className="text-white font-semibold mb-2">How to Use:</h4>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• Open this QR code at the vending machine</li>
              <li>• Select "Scan QR Code" on the Nayax DOT screen</li>
              <li>• Hold your phone up to the scanner</li>
              <li>• Get instant promotions and bonus points!</li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={generateQRCode}
              disabled={isGenerating}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh Code
            </Button>

            <Button
              onClick={copyQRData}
              className="bg-slate-600 hover:bg-slate-500 text-white"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? "Copied!" : "Copy Data"}
            </Button>
          </div>

          <div className="bg-orange-100 border border-orange-400 p-3 rounded-lg">
            <p className="text-orange-800 text-sm font-semibold">
              🎯 Show this QR code at any Hi-Vis vending machine to unlock exclusive promotions 
              and earn bonus points based on your loyalty tier!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}