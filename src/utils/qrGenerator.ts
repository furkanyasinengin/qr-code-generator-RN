import QRCode from 'qrcode';
import type { QRCode as QRCodeType } from 'qrcode';

export const getQRCode = (
  text: string,
  hasLogo: boolean = false,
): QRCodeType => {
  const ecLevel = hasLogo ? 'H' : 'M';
  return QRCode.create(text, { errorCorrectionLevel: ecLevel });
};

export const isFinderPattern = (
  row: number,
  col: number,
  size: number,
): boolean => {
  if (
    (row < 7 && col < 7) ||
    (row < 7 && col >= size - 7) ||
    (row >= size - 7 && col < 7)
  )
    return true;
  return false;
};

export const isLogoArea = (row: number, col: number, size: number): boolean => {
  const logoRatio = 0.2;
  const logoSize = size * logoRatio;
  const padding = 1.5;
  const start = (size - logoSize) / 2 - padding;
  const end = size - start;
  if (row >= start && row <= end && col >= start && col <= end) return true;

  return false;
};

type FormDataType = {
  url: string;
  text: string;
  //wifi
  wifiName: string;
  wifiIsHidden: boolean;
  wifiEncryption: string;
  wifiPassword: string;
  //vcard
  vcardName: string;
  vcardPhone: string;
  vcardEmail: string;
  vcardCompany: string;
  vcardWorkTitle: string;
  vcardWebsite: string;
  // Email
  emailTo: string;
  emailSubject: string;
  emailBody: string;
  // Phone
  phoneNum: string;
  // SMS
  smsNum: string;
  smsMsg: string;
  // Location
  geoLat: string;
  geoLng: string;
  // Event
  eventTitle: string;
  eventLocation: string;
  eventStart: string; // Format: YYYYMMDDTHHMMSSZ
  eventEnd: string; // Format: YYYYMMDDTHHMMSSZ
  eventNotes: string;
};
export const generateQRString = (qrType: string, formData: FormDataType) => {
  switch (qrType) {
    case 'wifi': {
      const wifiArray = [];
      wifiArray.push(`S:${formData.wifiName}`);
      if (formData.wifiEncryption === 'None') {
        wifiArray.push(`T:nopass`);
      } else {
        wifiArray.push(`T:${formData.wifiEncryption}`);
        wifiArray.push(`P:${formData.wifiPassword}`);
      }
      if (formData.wifiIsHidden) {
        wifiArray.push(`H:true`);
      }
      return `WIFI:${wifiArray.join(';')};;`;
    }
    case 'vcard': {
      const vcardArray = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${formData.vcardName}`,
        `TEL:${formData.vcardPhone}`,
      ];
      if (formData.vcardEmail) {
        vcardArray.push(`EMAIL:${formData.vcardEmail}`);
      }
      if (formData.vcardCompany) {
        vcardArray.push(`ORG:${formData.vcardCompany}`);
      }
      if (formData.vcardWorkTitle) {
        vcardArray.push(`TITLE:${formData.vcardWorkTitle}`);
      }
      if (formData.vcardWebsite) {
        vcardArray.push(`URL:${formData.vcardWebsite}`);
      }
      vcardArray.push('END:VCARD');
      return vcardArray.join('\n');
    }
    case 'email':
      return `MATMSG:TO:${formData.emailTo};SUB:${formData.emailSubject};BODY:${formData.emailBody};;`;
    case 'phone':
      return `tel:${formData.phoneNum}`;
    case 'sms':
      return `smsto:${formData.smsNum}:${formData.smsMsg}`;

    case 'location':
      return `geo:${formData.geoLat},${formData.geoLng}`;

    case 'event':
      const eventArray = [
        'BEGIN:VEVENT',
        `SUMMARY:${formData.eventTitle}`,
        `LOCATION:${formData.eventLocation}`,
        `DESCRIPTION:${formData.eventNotes}`,
        `DTSTART:${formData.eventStart}`,
        `DTEND:${formData.eventEnd}`,
        'END:VEVENT',
      ];
      return eventArray.join('\n');
    case 'text':
      return formData.text || ' ';
    case 'url':
    default:
      return formData.url || ' ';
  }
};
