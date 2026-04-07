export const getQrType = (data: string) => {
  const upperData = data.toUpperCase();
  if (upperData.startsWith('HTTP')) return 'url';
  if (upperData.startsWith('WIFI:')) return 'wifi';
  if (upperData.startsWith('BEGIN:VCARD')) return 'vcard';
  if (upperData.startsWith('MATMSG:') || upperData.startsWith('MAILTO:'))
    return 'email';
  if (upperData.startsWith('TEL:')) return 'phone';
  if (upperData.startsWith('SMSTO:') || upperData.startsWith('SMS:'))
    return 'sms';
  if (upperData.startsWith('GEO:')) return 'location';
  if (upperData.startsWith('BEGIN:VEVENT')) return 'event';
  return 'text';
};

export const parseVcardData = (data: string) => {
  const getMatch = (prefix: string) => {
    const regex = new RegExp(`^${prefix}[^:]*:(.*)`, 'im');
    const match = data.match(regex);
    return match ? match[1].replace(/\r/g, '').trim() : '';
  };

  const formattedName = getMatch('FN');
  const rawName = getMatch('N').replace(/;/g, ' ').trim();

  return {
    fn: formattedName || rawName,
    tel: getMatch('TEL'),
    email: getMatch('EMAIL'),
    org: getMatch('ORG'),
    title: getMatch('TITLE'),
    url: getMatch('URL'),
  };
};

export const parseWifiData = (data: string) => {
  const ssidMatch = data.match(/S:([^;]+)/);
  const passwordMatch = data.match(/P:([^;]+)/);
  const typeMatch = data.match(/T:([^;]+)/);
  const hiddenMatch = data.match(/H:([^;]+)/);

  return {
    ssid: ssidMatch ? ssidMatch[1] : '',
    password: passwordMatch ? passwordMatch[1] : '',
    type: typeMatch ? typeMatch[1].toUpperCase() : 'WPA',
    isHidden: hiddenMatch ? hiddenMatch[1].toLowerCase() === 'true' : false,
  };
};

export const parseEventData = (data: string) => {
  const getValue = (regex: RegExp) => {
    const match = data.match(regex);
    return match ? match[1].trim() : '';
  };

  return {
    title: getValue(/SUMMARY:(.*)/i),
    location: getValue(/LOCATION:(.*)/i),
    start: getValue(/DTSTART:(.*)/i),
    end: getValue(/DTEND:(.*)/i),
    notes: getValue(/DESCRIPTION:(.*)/i),
  };
};

export const parseSmsData = (data: string) => {
  const parts = data.replace(/smsto:/i, '').split(':');
  return {
    phone: parts[0] || '',
    message: parts.slice(1).join(':') || '',
  };
};

export const parseEmailData = (data: string) => {
  let email = '',
    subject = '',
    body = '';
  if (data.toUpperCase().startsWith('MATMSG:')) {
    const toMatch = data.match(/TO:([^;]+)/i);
    const subMatch = data.match(/SUB:([^;]+)/i);
    const bodyMatch = data.match(/BODY:([^;]+)/i);
    email = toMatch ? toMatch[1] : '';
    subject = subMatch ? subMatch[1] : '';
    body = bodyMatch ? bodyMatch[1] : '';
  } else if (data.toUpperCase().startsWith('MAILTO:')) {
    email = data.replace(/mailto:/i, '');
  }
  return { email, subject, body };
};
