const QRCode = require('qrcode');
const db = require('../database/db');
require('dotenv').config();

const generateQRCode = async (gemstoneId, type = 'product') => {
  try {
    const gemstone = await db('gemstones').where({ id: gemstoneId }).first();
    
    if (!gemstone) {
      throw new Error('Gemstone not found');
    }
    
    let qrData;
    if (type === 'product') {
      // Product-specific QR code with tracking parameter
      qrData = `${process.env.APP_URL || 'http://localhost:3000'}/product/${gemstone.sku}?qr=true`;
    } else {
      // Master QR code for entire catalog
      qrData = `${process.env.APP_URL || 'http://localhost:3000'}/catalog`;
    }
    
    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    });
    
    // Update gemstone with QR code data
    if (type === 'product') {
      await db('gemstones')
        .where({ id: gemstoneId })
        .update({
          qr_code: qrData,
          qr_code_data: qrCodeDataURL
        });
    }
    
    return {
      dataURL: qrCodeDataURL,
      url: qrData
    };
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw error;
  }
};

const generateMasterQR = async () => {
  try {
    const qrData = `${process.env.APP_URL || 'http://localhost:3000'}/catalog`;
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 400
    });
    
    return {
      dataURL: qrCodeDataURL,
      url: qrData
    };
  } catch (error) {
    console.error('Master QR generation error:', error);
    throw error;
  }
};

module.exports = {
  generateQRCode,
  generateMasterQR
};

