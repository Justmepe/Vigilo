// QR Code generation utility for safety cards

import QRCode from 'qrcode';

export const generateQRCode = async (data) => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(data), {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
};

export const generateQRCodeCanvas = async (data) => {
  try {
    const canvas = document.createElement('canvas');
    await QRCode.toCanvas(canvas, JSON.stringify(data), {
      errorCorrectionLevel: 'H',
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return canvas;
  } catch (error) {
    console.error('Error generating QR code canvas:', error);
    return null;
  }
};
